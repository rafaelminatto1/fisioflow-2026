import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscriptions, patients } from '@/db/schema';
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

// GET /api/payments/subscriptions - List subscriptions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');

    const conditions = [];

    if (patientId) {
      conditions.push(eq(subscriptions.patientId, patientId));
    }
    if (status) {
      conditions.push(eq(subscriptions.status, status as any));
    }

    const results = await db.select()
      .from(subscriptions)
      .where(conditions.length > 0 ? eq(subscriptions.patientId, patientId || '') : undefined);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

// POST /api/payments/subscriptions - Create a subscription
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
    const { patientId, priceId, planName, metadata = {} } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: 'priceId is required' },
        { status: 400 }
      );
    }

    // Get patient info
    let patient = null;
    let stripeCustomerId = null;

    if (patientId) {
      const patientsResult = await db.select().from(patients).where(eq(patients.id, patientId)).limit(1);
      patient = patientsResult[0];

      // Create or get Stripe customer
      if (patient?.email) {
        const customers = await stripe.customers.list({
          email: patient.email,
          limit: 1,
        });

        if (customers.data.length > 0) {
          stripeCustomerId = customers.data[0].id;
        } else {
          const newCustomer = await stripe.customers.create({
            email: patient.email,
            name: patient.fullName,
            phone: patient.phone || undefined,
            metadata: {
              patientId,
            },
          });
          stripeCustomerId = newCustomer.id;
        }
      }
    }

    // Create checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: stripeCustomerId || undefined,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payments/cancel`,
      subscription_data: {
        metadata: {
          patientId: patientId || '',
          planName: planName || 'subscription',
          ...metadata,
        },
      },
      metadata: {
        patientId: patientId || '',
        planName: planName || 'subscription',
        ...metadata,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
