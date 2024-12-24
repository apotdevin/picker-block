"use client";

import { BlocksSection } from "@/components/blocks";
import { Options } from "@/components/options";
import { blockOptions } from "@/query/blocks";
import { useSuspenseQuery } from "@tanstack/react-query";

export const MainView = () => {
  const { data } = useSuspenseQuery(blockOptions);

  return (
    <div className="p-4">
      <BlocksSection blocks={data} />
      <Options />
    </div>
  );
};
