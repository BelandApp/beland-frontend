import { useCallback, useMemo, useState } from "react";

export type UsePaginationProps = {
  initialPage?: number;
  limit: number;
  total: number;
};
export type UsePaginationReturn = {
  page: number;
  totalPages: number;
  canNext: boolean;
  canPrev: boolean;
  next: () => void;
  prev: () => void;
};
export function usePagination({
  initialPage = 1,
  limit,
  total,
}: UsePaginationProps) {
  const [page, setPage] = useState(initialPage);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const canNext = page < totalPages;
  const canPrev = page > 1;

  const next = useCallback(() => {
    if (canNext) setPage((p) => p + 1);
  }, [canNext]);

  const prev = useCallback(() => {
    if (canPrev) setPage((p) => p - 1);
  }, [canPrev]);

  const goTo = useCallback(
    (p: number) => {
      if (p >= 1 && p <= totalPages) setPage(p);
    },
    [totalPages],
  );

  return {
    page,
    setPage: goTo,
    totalPages,
    canNext,
    canPrev,
    next,
    prev,
  };
}
