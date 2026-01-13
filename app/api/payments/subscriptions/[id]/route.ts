import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscriptions } from '@/db/schema';
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

// GET /api/payments/subscriptions/[id] - Get subscription details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const subscriptionList = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.id, id))
      .limit(1);

    if (!subscriptionList[0]) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(subscriptionList[0]);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

// PATCH /api/payments/subscriptions/[id] - Modify subscription
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 503 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { action, priceId } = body;

    const subscriptionList = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.id, id))
      .limit(1);

    if (!subscriptionList[0]) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    const localSubscription = subscriptionList[0];
    const stripeSubscriptionId = localSubscription.stripeSubscriptionId;

    let updatedSubscription;

    switch (action) {
      case 'cancel':
        // Cancel at period end
        updatedSubscription = await stripe.subscriptions.update(stripeSubscriptionId, {
          cancel_at_period_end: true,
        } as any);
        break;

      case 'cancel_immediately':
        // Cancel immediately
        updatedSubscription = await stripe.subscriptions.cancel(stripeSubscriptionId);
        break;

      case 'resume':
        // Resume subscription (only if cancel_at_period_end is true)
        updatedSubscription = await stripe.subscriptions.update(stripeSubscriptionId, {
          cancel_at_period_end: false,
        } as any);
        break;

      case 'update_price':
        // Update subscription price
        if (!priceId) {
          return NextResponse.json(
            { error: 'priceId is required for price update' },
            { status: 400 }
          );
        }
        updatedSubscription = await stripe.subscriptions.update(stripeSubscriptionId, {
          items: [{
            id: localSubscription.stripeItemId || '',
            price: priceId,
          }],
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: cancel, cancel_immediately, resume, or update_price' },
          { status: 400 }
        );
    }

    // Update local subscription
    const sub = updatedSubscription as any;
    await db.update(subscriptions)
      .set({
        status: sub.status,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, id));

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error('Error modifying subscription:', error);
    return NextResponse.json(
      { error: 'Failed to modify subscription' },
      { status: 500 }
    );
  }
}

// DELETE /api/payments/subscriptions/[id] - Delete subscription
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 503 }
      );
    }

    const { id } = await params;

    const subscriptionList = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.id, id))
      .limit(1);

    if (!subscriptionList[0]) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Cancel in Stripe
    await stripe.subscriptions.cancel(subscriptionList[0].stripeSubscriptionId);

    // Update local status
    await db.update(subscriptions)
      .set({
        status: 'canceled',
        endedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    );
  }
}
