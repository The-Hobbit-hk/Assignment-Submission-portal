"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";
import { ApiError, getErrorMessage } from "@/lib/api-client";
import { toast } from "@/lib/toast";

const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 10 * 60 * 1000;

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            if (query.meta?.silent) return;
            toast.error(getErrorMessage(error), `query-${query.queryKey.join("-")}`);
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            toast.error(getErrorMessage(error));
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: STALE_TIME,
            gcTime: GC_TIME,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: (failureCount, error) => {
              if (error instanceof ApiError && [401, 403, 404].includes(error.status)) {
                return false;
              }
              return failureCount < 1;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
