import { useEffect, useState } from "react";

/**
 * Institutional Data Hook
 * Features: Type-safe asynchronous data retrieval with robust lifecycle management.
 */
export const useFetch = <T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = [],
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchFn();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, isLoading, error };
};
