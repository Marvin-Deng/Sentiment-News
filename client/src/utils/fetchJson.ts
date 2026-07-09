export const fetchJson = async <T>(
  url: string,
  options?: RequestInit,
  errorLabel?: string,
): Promise<T> => {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`${errorLabel ?? url} failed: ${res.status}`);
  return res.json() as Promise<T>;
};
