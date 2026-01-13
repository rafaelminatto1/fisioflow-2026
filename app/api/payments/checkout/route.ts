import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patients, payments, paymentMethods, subscriptions } from '@/db/schema';
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

// POST /api/payments/checkout - Create Stripe Checkout Session
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
    const { patientId, amount, description, metadata = {}, type = 'payment' } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Get patient info for checkout
    let patient = null;
    if (patientId) {
      const patientList = await db.select().from(patients).where(eq(patients.id, patientId)).limit(1);
      patient = patientList[0];
    }

    // Create Stripe checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card', 'boleto'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: description || 'Pagamento de Serviço',
              description: metadata.appointmentId
                ? `Consulta - ${new Date(metadata.appointmentDate).toLocaleDateString('pt-BR')}`
                : undefined,
            },
            unit_amount: Math.round(amount * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: type === 'subscription' ? 'subscription' : 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payments/cancel`,
      metadata: {
        patientId: patientId || '',
        ...metadata,
      },
    };

    // Add customer info if available
    if (patient?.email) {
      sessionParams.customer_email = patient.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Create payment record in database
    await db.insert(payments).values({
      patientId: patientId || null,
      amount: String(amount),
      currency: 'BRL',
      status: 'pending',
      paymentMethod: type === 'subscription' ? 'subscription' : 'stripe',
      stripePaymentIntentId: session.payment_intent as string,
      stripeInvoiceId: session.invoice as string || null,
      metadata: {
        checkoutSessionId: session.id,
        ...metadata,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

// GET /api/payments/checkout - Get checkout session info
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
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve checkout session' },
      { status: 500 }
    );
  }
}
