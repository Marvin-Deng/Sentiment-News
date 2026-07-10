export const formatNumber = (value: number | null | undefined): string => {
  if (value == null || !Number.isFinite(value)) return "—";

  const rounded = Math.round(value * 100) / 100;
  const absRounded = Math.abs(rounded);
  const sign = rounded < 0 ? "-" : "";

  if (Number.isInteger(rounded)) {
    return `${sign}${Math.trunc(absRounded).toLocaleString("en-US")}`;
  }

  return `${sign}${absRounded.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatCurrency = (value: number | null | undefined): string =>
  value == null || !Number.isFinite(value) ? "—" : `$${formatNumber(value)}`;
