export type CreditSimulation = {
  amount: number;
  months: number;
  monthlyRate: number;
  installment: number;
  totalAmount: number;
  totalInterest: number;
};

export function calculateCreditSimulation(
  amount: number,
  months: number,
  monthlyRate = 0.0249,
): CreditSimulation {
  const installment =
    (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  const totalAmount = installment * months;
  const totalInterest = totalAmount - amount;

  return {
    amount,
    months,
    monthlyRate,
    installment,
    totalAmount,
    totalInterest,
  };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
