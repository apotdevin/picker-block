"use client";

import { BlocksSection } from "@/components/blocks";
import { Options } from "@/components/options";
import { blockOptions } from "@/query/blocks";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";

export const MainView = () => {
  const { data } = useSuspenseQuery(blockOptions);

  return (
    <div className="p-4">
      <Suspense>
        <BlocksSection blocks={data} />
        <Options />
      </Suspense>
    </div>
  );
};
