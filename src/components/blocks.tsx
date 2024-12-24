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

  const [messages, setMessages] = useState<Block[]>(blocks);

  const [socketStatus, setSocketStatus] = useState<
    "Disconnected" | "Connected" | "Error"
  >("Disconnected");

  const optionArray = useMemo(() => {
    return expandString(options);
  }, [options]);

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

              setMessages((prev) => {
                const fullArray = [...prev, ...parsed];
                const unique = uniqBy(fullArray, "id");
                return orderBy(unique, "height", "desc");
              });
            }
            break;

          case "ERROR":
            setSocketStatus("Error");
            break;

          case "CLOSED":
            setSocketStatus("Disconnected");
            break;

          case "LOADED":
            // workerRef.current?.postMessage({ type: "CONNECT" });
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

  const lastPerson = stringToNumberInRange(
    messages.length ? messages[0].id : "",
    0,
    optionArray.length - 1
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row w-full justify-between items-center">
        <h1 className="text-4xl font-black">PICKER BLOCK</h1>
        {messages.length ? (
          <div className="font-semibold text-xl md:text-2xl">{`Current: ${
            optionArray[lastPerson] || "..."
          }`}</div>
        ) : null}
      </div>

      <div className="w-full text-center md:text-right mt-4">
        {renderBadge()}
      </div>

      <div className="flex gap-2 overflow-auto w-full mt-4 mb-8">
        {messages.map((msg, idx) => {
          const number = stringToNumberInRange(
            msg.id,
            0,
            optionArray.length - 1
          );

          return (
            <div key={idx} className="min-w-[160px]">
              <a href={`https://mempool.space/block/${msg.id}`} target="_blank">
                <div className="rounded-xl border bg-card text-card-foreground flex flex-col justify-center items-center p-4">
                  <div className="font-semibold leading-none tracking-tight mb-2">
                    {optionArray[number]}
                  </div>

                  <p className="text-xs text-muted-foreground">{`Block ${msg.height}`}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNowStrict(new Date(msg.timestamp * 1000)) +
                      " ago"}
                  </p>
                </div>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};
