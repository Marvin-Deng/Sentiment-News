import { StockInfo } from "@/src/features/stocks/types";

export const rankStockMatch = (stock: StockInfo, query: string): number | null => {
  const q = query.toLowerCase();
  const symbol = stock.symbol.toLowerCase();
  const display = stock.displaySymbol.toLowerCase();
  const name = stock.description.toLowerCase();

  if (symbol === q || display === q) return 0;

  if (symbol.startsWith(q)) return 100 + (symbol.length - q.length);
  if (display.startsWith(q)) return 110 + (display.length - q.length);

  if (symbol.includes(q)) return 200 + symbol.indexOf(q);
  if (display.includes(q)) return 210 + display.indexOf(q);

  if (name.startsWith(q)) return 300 + name.length;

  const wordPrefixIndex = name.split(/\s+/).findIndex((word) => word.startsWith(q));
  if (wordPrefixIndex >= 0) return 320 + wordPrefixIndex * 10 + name.length;

  const nameIndex = name.indexOf(q);
  if (nameIndex >= 0) return 400 + nameIndex * 10 + name.length;

  return null;
};

export const sortStocksBySearch = (stocks: StockInfo[], query: string): StockInfo[] => {
  const trimmed = query.trim();
  if (!trimmed) return stocks;

  return stocks
    .map((stock) => ({ stock, score: rankStockMatch(stock, trimmed) }))
    .filter((entry): entry is { stock: StockInfo; score: number } => entry.score !== null)
    .sort((a, b) => a.score - b.score || a.stock.symbol.localeCompare(b.stock.symbol))
    .map(({ stock }) => stock);
};

export const rankStockSuggestions = (
  stocks: StockInfo[],
  query: string,
  limit: number,
): StockInfo[] => sortStocksBySearch(stocks, query).slice(0, limit);
