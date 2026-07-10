import { formatNumber } from "@/src/utils/numberUtils";

const formatSigned = (value: number): string =>
  value >= 0 ? `+${formatNumber(value)}` : formatNumber(value);

export const getPriceDiff = (
  firstPrice: number,
  secondPrice: number,
): number => {
  const priceDiff = secondPrice - firstPrice;
  return Math.round(priceDiff * 100) / 100;
};

export const getPercentChange = (
  firstPrice: number,
  secondPrice: number,
): number => {
  const percentChange = ((secondPrice - firstPrice) / firstPrice) * 100;
  return Math.round(percentChange * 100) / 100;
};

export const isPricePositive = (firstPrice: number, secondPrice: number): boolean =>
  firstPrice < secondPrice;

export const getPriceDiffStr = (
  firstPrice: number,
  secondPrice: number,
): string => formatSigned(getPriceDiff(firstPrice, secondPrice));

export const getPercentChangeStr = (
  firstPrice: number,
  secondPrice: number,
): string => `${formatSigned(getPercentChange(firstPrice, secondPrice))}%`;

export const getPriceStrArrow = (
  firstPrice: number,
  secondPrice: number,
): string => {
  const priceDiff = getPriceDiff(firstPrice, secondPrice);
  const percentChange = getPercentChange(firstPrice, secondPrice);
  const arrow = priceDiff >= 0 ? "▲" : "▼";

  return `${arrow}${formatSigned(priceDiff)} (${formatSigned(percentChange)}%)`;
};
