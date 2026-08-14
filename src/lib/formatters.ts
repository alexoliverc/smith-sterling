export function formatPhone(value: string) {
  const numbers = value.replace(/\D/g, '').slice(0, 11);

  return numbers.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

export function formatCep(value: string) {
  const numbers = value.replace(/\D/g, '').slice(0, 8);

  return numbers.replace(/^(\d{5})(\d)/, '$1-$2');
}

export function formatIncome(value: string) {
  const numbers = value.replace(/\D/g, '');

  if (!numbers) {
    return '';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(Number(numbers));
}
