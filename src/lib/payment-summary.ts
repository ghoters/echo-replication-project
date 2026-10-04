export type PaymentSummary = {
  figurinePrice: number;
  deliveryPrice: number;
  deliveryLabel: "Paczkomat" | "Kurier";
  configuration?: Record<string, string>;
};

export const PAYMENT_SUMMARY_KEY = "prezent3d-payment-summary";

export function savePaymentSummary(summary: PaymentSummary) {
  window.sessionStorage.setItem(PAYMENT_SUMMARY_KEY, JSON.stringify(summary));
}

export function readPaymentSummary(): PaymentSummary | null {
  const stored = window.sessionStorage.getItem(PAYMENT_SUMMARY_KEY);
  if (!stored) return null;

  try {
    const value = JSON.parse(stored) as Partial<PaymentSummary>;
    if (typeof value.figurinePrice !== "number" || typeof value.deliveryPrice !== "number") return null;
    if (value.deliveryLabel !== "Paczkomat" && value.deliveryLabel !== "Kurier") return null;
    return value as PaymentSummary;
  } catch {
    return null;
  }
}