'use client';

import React, { useState } from 'react';
import { CreditCardIcon, LoaderIcon } from './Icons';

interface StripeCheckoutButtonProps {
  patientId?: string;
  amount: number;
  description: string;
  metadata?: Record<string, any>;
  onSuccess?: (sessionId: string) => void;
  onError?: (error: string) => void;
  type?: 'payment' | 'subscription';
  className?: string;
}

export function StripeCheckoutButton({
  patientId,
  amount,
  description,
  metadata = {},
  onSuccess,
  onError,
  type = 'payment',
  className = '',
}: StripeCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId,
          amount,
          description,
          metadata,
          type,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { url, sessionId } = await response.json();

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <button
        onClick={handleCheckout}
        disabled={isLoading || amount <= 0}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <LoaderIcon className="w-4 h-4 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <CreditCardIcon className="w-4 h-4" />
            Pagar com Cartão
          </>
        )}
      </button>

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}

interface BoletoPaymentButtonProps {
  patientId?: string;
  amount: number;
  description: string;
  dueDate?: string;
  accountId?: string;
  metadata?: Record<string, any>;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function BoletoPaymentButton({
  patientId,
  amount,
  description,
  dueDate,
  accountId,
  metadata = {},
  onSuccess,
  onError,
  className = '',
}: BoletoPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [boletoData, setBoletoData] = useState<{
    paymentId: string;
    digitableLine: string;
    expiresAt: string;
    pdfUrl?: string;
  } | null>(null);

  const handleGenerateBoleto = async () => {
    setIsLoading(true);
    setError(null);
    setBoletoData(null);

    try {
      const response = await fetch('/api/payments/boleto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId,
          amount,
          description,
          dueDate,
          accountId,
          metadata,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate boleto');
      }

      const data = await response.json();

      // Poll for boleto details
      await pollForBoletoDetails(data.paymentIntentId, data.paymentId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const pollForBoletoDetails = async (paymentIntentId: string, paymentId: string) => {
    const maxAttempts = 10;
    const interval = 2000; // 2 seconds

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(`/api/payments/boleto?payment_intent_id=${paymentIntentId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.boletoDetails) {
            setBoletoData({
              paymentId,
              digitableLine: data.boletoDetails.digitableLine,
              expiresAt: data.boletoDetails.expiresAt,
              pdfUrl: data.boletoDetails.pdfUrl,
            });
            onSuccess?.(paymentId);
            return;
          }
        }
      } catch (err) {
        console.error('Error polling for boleto details:', err);
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    setError('Não foi possível obter os detalhes do boleto. Tente novamente mais tarde.');
  };

  const formatDigitableLine = (line: string) => {
    // Format the digitable line with dots for better readability
    return line.replace(/(.{5})(?=.)/g, '$1.').replace(/(.{5})\.(?=\d{3})/g, '$1 ');
  };

  return (
    <div className={className}>
      {!boletoData ? (
        <button
          onClick={handleGenerateBoleto}
          disabled={isLoading || amount <= 0}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <LoaderIcon className="w-4 h-4 animate-spin" />
              Gerando Boleto...
            </>
          ) : (
            <>
              <CreditCardIcon className="w-4 h-4" />
              Gerar Boleto
            </>
          )}
        </button>
      ) : (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Boleto gerado com sucesso!</p>
          <div className="bg-white p-3 rounded border border-gray-300 mb-2">
            <p className="text-xs text-gray-500 mb-1">Linha Digitável:</p>
            <p className="font-mono text-sm">{formatDigitableLine(boletoData.digitableLine)}</p>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Vencimento: {new Date(boletoData.expiresAt).toLocaleDateString('pt-BR')}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(boletoData.digitableLine)}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Copiar
            </button>
            {boletoData.pdfUrl && (
              <a
                href={boletoData.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                Abrir PDF
              </a>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}

interface PaymentMethodSelectorProps {
  patientId?: string;
  amount: number;
  description: string;
  metadata?: Record<string, any>;
  onSuccess?: (method: string, id: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function PaymentMethodSelector({
  patientId,
  amount,
  description,
  metadata = {},
  onSuccess,
  onError,
  className = '',
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'boleto' | null>(null);

  return (
    <div className={className}>
      <p className="text-sm text-gray-600 mb-3">Selecione a forma de pagamento:</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => setSelectedMethod('card')}
          className={`p-4 rounded-lg border-2 transition-colors ${
            selectedMethod === 'card'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <CreditCardIcon className="w-6 h-6 mx-auto mb-2 text-gray-700" />
          <p className="text-sm font-medium">Cartão</p>
          <p className="text-xs text-gray-500">Crédito/Débito</p>
        </button>

        <button
          onClick={() => setSelectedMethod('boleto')}
          className={`p-4 rounded-lg border-2 transition-colors ${
            selectedMethod === 'boleto'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <svg className="w-6 h-6 mx-auto mb-2 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm font-medium">Boleto</p>
          <p className="text-xs text-gray-500">Vencimento em 3-5 dias</p>
        </button>
      </div>

      {selectedMethod === 'card' && (
        <StripeCheckoutButton
          patientId={patientId}
          amount={amount}
          description={description}
          metadata={metadata}
          onSuccess={(id) => onSuccess?.('card', id)}
          onError={onError}
          className="w-full"
        />
      )}

      {selectedMethod === 'boleto' && (
        <BoletoPaymentButton
          patientId={patientId}
          amount={amount}
          description={description}
          metadata={metadata}
          onSuccess={(id) => onSuccess?.('boleto', id)}
          onError={onError}
          className="w-full"
        />
      )}
    </div>
  );
}
