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
