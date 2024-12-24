import { queryOptions } from "@tanstack/react-query";

export const blockOptions = queryOptions({
  queryKey: ["blocks"],
  queryFn: async () => {
    const response = await fetch("https://mempool.space/api/v1/blocks");
    return response.json();
  },
});
