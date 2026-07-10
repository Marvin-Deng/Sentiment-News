import { StockInfo } from "@/src/features/stocks/types";

export const rankStockMatch = (stock: StockInfo, query: string): number | null => {
  const q = query.toLowerCase();
  const symbol = stock.symbol.toLowerCase();
  const display = stock.displaySymbol.toLowerCase();
  const name = stock.description.toLowerCase();

  if (symbol === q || display === q) return 0;

  if (symbol.startsWith(q)) return 100 + (symbol.length - q.length);
  if (display.startsWith(q)) return 110 + (display.length - q.length);

  if (name.startsWith(q)) return 200 + name.length;

  const wordPrefixIndex = name.split(/\s+/).findIndex((word) => word.startsWith(q));
  if (wordPrefixIndex >= 0) return 220 + wordPrefixIndex * 10 + name.length;

  if (q.length > symbol.length && q.startsWith(symbol)) return 300 + (q.length - symbol.length);
  if (q.length > display.length && q.startsWith(display)) return 310 + (q.length - display.length);

  if (symbol.includes(q)) return 400 + symbol.indexOf(q);
  if (display.includes(q)) return 410 + display.indexOf(q);

  const nameIndex = name.indexOf(q);
  if (nameIndex >= 0) return 500 + nameIndex * 10 + name.length;

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
