import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patients, payments, accountsReceivable } from '@/db/schema';
import type { payments as paymentsType } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

// Helper to get Stripe instance (lazy initialization)
function getStripe(): Stripe | null {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    return null;
  }
  return new Stripe(apiKey, {
    apiVersion: '2025-12-15.clover' as any,
    typescript: true,
  });
}

// POST /api/payments/boleto - Create a boleto payment
export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      patientId,
      amount,
      description,
      dueDate,
      accountId,
      metadata = {}
    } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Get patient info
    let patient = null;
    if (patientId) {
      const patientsResult = await db.select().from(patients).where(eq(patients.id, patientId)).limit(1);
      patient = patientsResult[0];
    }

    // Create or get Stripe customer
    let stripeCustomerId = null;
    if (patient?.email || patient?.cpf) {
      const customers = await stripe.customers.list({
        email: patient?.email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        stripeCustomerId = customers.data[0].id;
      } else {
        // Create customer with CPF for boleto
        const newCustomer = await stripe.customers.create({
          email: patient?.email || undefined,
          name: patient?.fullName || undefined,
          phone: patient?.phone || undefined,
          address: patient?.address ? {
            line1: `${patient.address.street}, ${patient.address.number}`,
            city: patient.address.city,
            state: patient.address.state,
            postal_code: patient.address.zipCode,
          } : undefined,
          metadata: {
            patientId: patientId || '',
            cpf: patient?.cpf || '',
          },
        } as any);
        stripeCustomerId = newCustomer.id;
      }
    }

    // Calculate expiration date for boleto (typically 3-5 days from now or custom due date)
    const expiresAt = dueDate
      ? Math.floor(new Date(dueDate).getTime() / 1000)
      : Math.floor((Date.now() + 5 * 24 * 60 * 60 * 1000) / 1000); // 5 days from now

    // Create payment intent with boleto
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses cents
      currency: 'brl',
      customer: stripeCustomerId || undefined,
      payment_method_types: ['boleto'],
      payment_method_options: {
        boleto: {
          expiresAt: dueDate ? Math.floor(new Date(dueDate).getTime() / 1000) : undefined,
        } as any,
      },
      metadata: {
        patientId: patientId || '',
        accountId: accountId || '',
        description: description || 'Pagamento via Boleto',
        ...metadata,
      },
    });

    // Create payment record
    const insertedPayment = await db.insert(payments).values({
      patientId: patientId || null,
      amount: String(amount),
      currency: 'BRL',
      status: 'pending',
      paymentMethod: 'boleto',
      stripePaymentIntentId: paymentIntent.id,
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      metadata: {
        stripeCustomerId,
        checkoutSessionId: null,
        ...metadata,
      },
    } as typeof paymentsType.$inferInsert).returning();

    const paymentId = insertedPayment[0]?.id;

    // If linked to an account receivable, update it
    if (accountId) {
      await db.update(accountsReceivable)
        .set({
          paymentMethod: 'boleto',
          stripePaymentIntentId: paymentIntent.id,
          updatedAt: new Date(),
        })
        .where(eq(accountsReceivable.id, accountId));
    }

    return NextResponse.json({
      paymentId,
      paymentIntentId: paymentIntent.id,
      amount,
      currency: 'BRL',
      status: 'pending',
      expiresAt: new Date(expiresAt * 1000),
      // Next steps for the client
      nextAction: paymentIntent.next_action,
    });
  } catch (error) {
    console.error('Error creating boleto:', error);
    return NextResponse.json(
      { error: 'Failed to create boleto' },
      { status: 500 }
    );
  }
}

// GET /api/payments/boleto - Get boleto status
export async function GET(request: NextRequest) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get('payment_intent_id');
    const paymentId = searchParams.get('payment_id');

    let stripePaymentIntentId = paymentIntentId;

    // If paymentId is provided, get the stripe payment intent from database
    if (paymentId && !stripePaymentIntentId) {
      const paymentList = await db.select()
        .from(payments)
        .where(eq(payments.id, paymentId))
        .limit(1);

      if (paymentList[0]) {
        stripePaymentIntentId = paymentList[0].stripePaymentIntentId;
      }
    }

    if (!stripePaymentIntentId) {
      return NextResponse.json(
        { error: 'payment_intent_id or payment_id is required' },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);

    // Get boleto details if available
    let boletoDetails = null;
    if (paymentIntent.next_action?.boleto_display_details) {
      const details = paymentIntent.next_action.boleto_display_details as any;
      boletoDetails = {
        digitableLine: details.digitable_line,
        expiresAt: details.expires_at,
        issuer: details.issuer,
      };
    }

    return NextResponse.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      created: new Date(paymentIntent.created * 1000),
      boletoDetails,
    });
  } catch (error) {
    console.error('Error retrieving boleto:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve boleto' },
      { status: 500 }
    );
  }
}
