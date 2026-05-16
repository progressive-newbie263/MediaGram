import { useEffect, useRef, useCallback } from "react";

/**
 * Calls `fetchMore` when the sentinel element enters the viewport.
 * @param {Function} fetchMore - function to load next page
 * @param {boolean}  hasMore   - whether more pages exist
 */
const useInfiniteScroll = (fetchMore, hasMore) => {
  const sentinelRef = useRef(null);

  const handleObserver = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore) fetchMore();
    },
    [fetchMore, hasMore]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  return sentinelRef;
};

export default useInfiniteScroll;
