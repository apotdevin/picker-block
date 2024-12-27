import {
  expandString,
  parseData,
  stringToNumberInRange,
} from "@/utils/messages";
import { useQueryState } from "nuqs";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { Circle, RefreshCcw } from "lucide-react";
import { orderBy, uniqBy } from "lodash";
import { formatDistanceToNowStrict } from "date-fns";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

type Block = { id: string; height: string; timestamp: number };

export const BlocksSection: FC<{ blocks: Block[] }> = ({ blocks }) => {
  const [options] = useQueryState("options");

  const workerRef = useRef<Worker | null>(null);

  const [loading, setLoading] = useState(false);

  const [_messages, setMessages] = useState<Block[]>(blocks);

  const [socketStatus, setSocketStatus] = useState<
    "Disconnected" | "Connected" | "Error"
  >("Disconnected");

  const optionArray = useMemo(() => {
    return expandString(options);
  }, [options]);

  const rows = useMemo(() => {
    const unique = uniqBy(_messages, "id");
    const ordered = orderBy(unique, "height", "desc");

    const enriched = ordered.map((b) => {
      const hashToNumber = stringToNumberInRange(
        b.id,
        0,
        optionArray.length - 1
      );

      const hashToOption = optionArray[hashToNumber];

      return { ...b, hashToNumber, hashToOption };
    });

    const rows = {
      first: enriched[0],
      second: [enriched[1], enriched[2]],
      third: [enriched[3], enriched[4], enriched[5]],
      fourth: [enriched[6], enriched[7], enriched[8], enriched[9]],
    };

    return rows;
  }, [_messages, optionArray]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      workerRef.current = new Worker(
        /* webpackIgnore: true */ "/workers/mempool-worker.js"
      );

      workerRef.current.onmessage = (event) => {
        const { type, data } = event.data as {
          type: "CONNECTED" | "MESSAGE" | "ERROR" | "CLOSED" | "LOADED";
          data?: string;
          error?: string;
        };

        switch (type) {
          case "CONNECTED":
            setSocketStatus("Connected");
            setLoading(false);
            break;
          case "MESSAGE":
            if (data) {
              const parsed = parseData(data);
              setMessages((prev) => [...prev, ...parsed]);
            }
            break;

          case "ERROR":
            setSocketStatus("Error");
            break;

          case "CLOSED":
            setSocketStatus("Disconnected");
            break;

          case "LOADED":
            break;
        }
      };
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: "DISCONNECT" });
        workerRef.current.terminate();
      }
    };
  }, []);

  const handleConnect = () => {
    setLoading(true);
    workerRef.current?.postMessage({ type: "CONNECT" });
  };

  const renderBadge = () => {
    if (socketStatus === "Connected") {
      return (
        <Badge variant={"secondary"}>
          <div className="flex gap-1 justify-center items-center">
            Connected
            <Circle size={12} fill="green" stroke="green" />
          </div>
        </Badge>
      );
    }

    if (socketStatus === "Disconnected") {
      return (
        <button onClick={handleConnect}>
          <Badge variant={"outline"}>
            <div className="flex gap-1 justify-center items-center">
              Sync
              <RefreshCcw size={12} className={cn(loading && "animate-spin")} />
            </div>
          </Badge>
        </button>
      );
    }

    return (
      <button onClick={handleConnect}>
        <Badge variant={"destructive"}>
          <div className="flex gap-1 justify-center items-center">
            Resync
            <RefreshCcw size={12} className={cn(loading && "animate-spin")} />
          </div>
        </Badge>
      </button>
    );
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row w-full justify-center items-center">
        <h1 className="text-4xl font-black">PICKER BLOCK</h1>
      </div>

      <div className="flex flex-col justify-center items-center gap-2 mt-6">
        <div className="min-w-[160px]">
          <a
            href={`https://mempool.space/block/${rows.first.id}`}
            target="_blank"
          >
            <div className="rounded-xl border bg-card text-card-foreground flex flex-col justify-center items-center p-4 bg-violet-300 hover:bg-violet-400">
              <div className="font-black leading-none tracking-tight mb-2">
                {"1. " + rows.first.hashToOption}
              </div>

              <p className="text-xs">{`Block ${rows.first.height}`}</p>
              <p className="text-xs">
                {formatDistanceToNowStrict(
                  new Date(rows.first.timestamp * 1000)
                ) + " ago"}
              </p>
            </div>
          </a>
        </div>

        <div className="flex gap-2 overflow-auto w-full justify-center">
          {rows.second.map((msg, idx) => {
            return (
              <div key={idx} className="min-w-[160px]">
                <a
                  href={`https://mempool.space/block/${msg.id}`}
                  target="_blank"
                >
                  <div className="rounded-xl border bg-card text-card-foreground flex flex-col justify-center items-center p-4 bg-indigo-300 hover:bg-indigo-400">
                    <div className="font-semibold leading-none tracking-tight mb-2">
                      {`${idx + 2}. ` + msg.hashToOption}
                    </div>

                    <p className="text-xs">{`Block ${msg.height}`}</p>
                    <p className="text-xs">
                      {formatDistanceToNowStrict(
                        new Date(msg.timestamp * 1000)
                      ) + " ago"}
                    </p>
                  </div>
                </a>
              </div>
            );
          })}
        </div>

        <div className="gap-2 overflow-auto w-full justify-center md:flex hidden">
          {rows.third.map((msg, idx) => {
            return (
              <div key={idx} className="min-w-[160px]">
                <a
                  href={`https://mempool.space/block/${msg.id}`}
                  target="_blank"
                >
                  <div className="rounded-xl border bg-card text-card-foreground flex flex-col justify-center items-center p-4 bg-blue-300 hover:bg-blue-400">
                    <div className="font-semibold leading-none tracking-tight mb-2">
                      {`${idx + 4}. ` + msg.hashToOption}
                    </div>

                    <p className="text-xs">{`Block ${msg.height}`}</p>
                    <p className="text-xs">
                      {formatDistanceToNowStrict(
                        new Date(msg.timestamp * 1000)
                      ) + " ago"}
                    </p>
                  </div>
                </a>
              </div>
            );
          })}
        </div>

        <div className="gap-2 overflow-auto w-full justify-center md:flex hidden">
          {rows.fourth.map((msg, idx) => {
            return (
              <div key={idx} className="min-w-[160px]">
                <a
                  href={`https://mempool.space/block/${msg.id}`}
                  target="_blank"
                >
                  <div className="rounded-xl border bg-card text-card-foreground flex flex-col justify-center items-center p-4 bg-sky-300 hover:bg-sky-400">
                    <div className="font-semibold leading-none tracking-tight mb-2">
                      {`${idx + 7}. ` + msg.hashToOption}
                    </div>

                    <p className="text-xs">{`Block ${msg.height}`}</p>
                    <p className="text-xs">
                      {formatDistanceToNowStrict(
                        new Date(msg.timestamp * 1000)
                      ) + " ago"}
                    </p>
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      </div>
      <div className="w-full text-center mt-4 mb-8">{renderBadge()}</div>
    </div>
  );
};
