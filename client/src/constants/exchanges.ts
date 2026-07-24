// Major primary exchanges, shown before smaller/OTC venues when sorting exchange lists.
const PRIMARY_EXCHANGE_MICS = ["XNAS", "XNYS", "XASE", "ARCX"];

export const compareExchangeMics = (a: string, b: string): number => {
  const aIndex = PRIMARY_EXCHANGE_MICS.indexOf(a);
  const bIndex = PRIMARY_EXCHANGE_MICS.indexOf(b);

  if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
  if (aIndex !== -1) return -1;
  if (bIndex !== -1) return 1;
  return a.localeCompare(b);
};
