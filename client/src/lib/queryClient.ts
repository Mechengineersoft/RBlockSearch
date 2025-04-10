import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: {
      ...data ? { "Content-Type": "application/json" } : {},
      "Accept": "application/json"
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
    mode: "cors"
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true,
      staleTime: 30000, // 30 seconds in milliseconds
      cacheTime: 30000, // Clear cache after 30 seconds
      retry: 1, // Allow one retry
    },
    mutations: {
      retry: 1,
    },
  },
});

// Clear cache when window gains focus after being hidden or in standalone mode
if (typeof window !== 'undefined') {
  // Handle visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      queryClient.clear();
    }
  });

  // Handle standalone mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    // Invalidate cache more frequently in standalone mode
    setInterval(() => {
      queryClient.invalidateQueries();
    }, 15000); // Every 15 seconds
  }
}
