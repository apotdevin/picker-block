import { blockOptions } from "@/query/blocks";
import { getQueryClient } from "@/query/getClient";
import { MainView } from "@/view/main";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

export default function Home() {
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(blockOptions);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainView />
    </HydrationBoundary>
  );
}
