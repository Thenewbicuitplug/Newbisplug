export function formatZAR(amount: number): string {
  if (isNaN(amount)) return 'R 0.00';
  return `R ${amount.toFixed(2)}`;
}

export function formatShortDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-ZA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
}
