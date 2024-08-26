import { useQuery, QueryFunction } from "react-query";

export function useQueryNoRefetch<TData>(queryKey: string, queryFn: QueryFunction<TData>) {
  return useQuery(queryKey, queryFn, {
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}
