import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clinicSettings } from '@/db/schema';

// GET /api/settings/payment-methods - Get payment methods
export async function GET() {
  try {
    // TODO: Implement actual payment methods retrieval from clinic_settings
    const paymentMethods = [
      { id: '1', name: 'Dinheiro', enabled: true, icon: 'money' },
      { id: '2', name: 'PIX', enabled: true, icon: 'qr-code' },
      { id: '3', name: 'Cartão de Crédito', enabled: true, icon: 'credit-card' },
      { id: '4', name: 'Cartão de Débito', enabled: true, icon: 'credit-card' },
      { id: '5', name: 'Transferência Bancária', enabled: true, icon: 'bank' },
      { id: '6', name: 'Boleto', enabled: false, icon: 'file-text' },
    ];

    return NextResponse.json(paymentMethods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}

// PUT /api/settings/payment-methods - Update payment methods
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { methods } = body;

    if (!Array.isArray(methods)) {
      return NextResponse.json(
        { error: 'methods must be an array' },
        { status: 400 }
      );
    }

    // TODO: Implement actual payment methods update to clinic_settings
    // await db.update(clinicSettings).set({
    //   paymentMethods: methods,
    //   updatedAt: new Date(),
    // });

    return NextResponse.json({
      success: true,
      message: 'Payment methods updated',
      data: methods,
    });
  } catch (error) {
    console.error('Error updating payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to update payment methods' },
      { status: 500 }
    );
  }
}
