import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { payments, subscriptions, accountsReceivable } from '@/db/schema';
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

// Helper to verify webhook signature
async function getRawBody(request: NextRequest): Promise<Buffer> {
  const arrayBuffer = await request.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// POST /api/payments/webhooks - Handle Stripe webhooks
export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 503 }
      );
    }

    const body = await getRawBody(request);
    const signature = (await headers()).get('stripe-signature') || '';

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Handle checkout session completed
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const { patientId, appointmentId } = session.metadata || {};

  // Update payment status
  await db.update(payments)
    .set({
      status: 'completed',
      paidAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(payments.id, session.id));

  // Update account receivable if exists
  if (patientId && session.amount_total) {
    const accounts = await db.select()
      .from(accountsReceivable)
      .where(eq(accountsReceivable.patientId, patientId));

    for (const account of accounts) {
      if (account.status !== 'paid') {
        const paidAmount = account.paidAmount + session.amount_total / 100;
        const isFullyPaid = paidAmount >= account.amount;

        await db.update(accountsReceivable)
          .set({
            paidAmount,
            status: isFullyPaid ? 'paid' : 'partial',
            paidAt: isFullyPaid ? new Date() : account.paidAt,
            updatedAt: new Date(),
          })
          .where(eq(accountsReceivable.id, account.id));
      }
    }
  }
}

// Handle payment intent succeeded
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { patientId, appointmentId } = paymentIntent.metadata || {};

  // Find and update payment by stripe payment intent
  const paymentRecords = await db.select()
    .from(payments)
    .where(eq(payments.stripePaymentIntentId, paymentIntent.id))
    .limit(1);

  if (paymentRecords[0]) {
    await db.update(payments)
      .set({
        status: 'completed',
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(payments.id, paymentRecords[0].id));
  }
}

// Handle payment failed
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  // Find and update payment by stripe payment intent
  const paymentRecords = await db.select()
    .from(payments)
    .where(eq(payments.stripePaymentIntentId, paymentIntent.id))
    .limit(1);

  if (paymentRecords[0]) {
    const existingMetadata = typeof paymentRecords[0].metadata === 'string'
      ? JSON.parse(paymentRecords[0].metadata || '{}')
      : (paymentRecords[0].metadata || {});

    await db.update(payments)
      .set({
        status: 'failed',
        updatedAt: new Date(),
        metadata: {
          ...existingMetadata,
          lastPaymentError: paymentIntent.last_payment_error?.message,
        },
      })
      .where(eq(payments.id, paymentRecords[0].id));
  }
}

// Handle invoice paid (for subscriptions)
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  if ((invoice as any).subscription) {
    await db.update(subscriptions)
      .set({
        status: 'active',
        lastPaymentDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.stripeSubscriptionId, (invoice as any).subscription));
  }
}

// Handle invoice payment failed (for subscriptions)
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if ((invoice as any).subscription) {
    await db.update(subscriptions)
      .set({
        status: 'past_due',
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.stripeSubscriptionId, (invoice as any).subscription));
  }
}

// Handle subscription created
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const sub = subscription as any;
  const { patientId, planId } = sub.metadata || {};
  const priceId = sub.items?.data?.[0]?.price?.id;

  await db.insert(subscriptions).values({
    id: crypto.randomUUID(),
    stripeSubscriptionId: sub.id,
    stripeCustomerId: sub.customer as string,
    stripePriceId: priceId,
    patientId: patientId || null,
    status: sub.status,
    currentPeriodStart: new Date(sub.current_period_start * 1000),
    currentPeriodEnd: new Date(sub.current_period_end * 1000),
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const sub = subscription as any;
  await db.update(subscriptions)
    .set({
      status: sub.status,
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      canceledAt: sub.canceled_at
        ? new Date(sub.canceled_at * 1000)
        : null,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, sub.id));
}

// Handle subscription deleted
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await db.update(subscriptions)
    .set({
      status: 'canceled',
      endedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
}
