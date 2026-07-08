// Maps ISO 10383 Market Identifier Codes (MIC) to a human-readable exchange name, for exchanges
// that appear in Finnhub's US symbol list. Falls back to the raw MIC if not listed here.
const MIC_NAMES: Record<string, string> = {
  XNAS: "Nasdaq",
  XNYS: "New York Stock Exchange",
  XASE: "NYSE American",
  ARCX: "NYSE Arca",
  BATS: "Cboe BZX",
  IEXG: "IEX",
  OTCM: "OTC Markets",
  PINX: "OTC Pink",
};

export const formatExchangeLabel = (mic: string): string => {
  const name = MIC_NAMES[mic];
  return name ? `${name} (${mic})` : mic;
};

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
