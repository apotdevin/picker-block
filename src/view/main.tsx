"use client";

import { parseData, stringToNumberInRange } from "@/utils/messages";
import { useEffect, useRef, useState } from "react";

export const MainView = () => {
  const workerRef = useRef<Worker | null>(null);

  const [messages, setMessages] = useState<{ id: string; height: string }[]>(
    []
  );

  const [socketStatus, setSocketStatus] = useState<
    "Disconnected" | "Connected" | "Error"
  >("Disconnected");

  useEffect(() => {
    // Only run on client
    if (typeof window !== "undefined") {
      workerRef.current = new Worker(
        /* webpackIgnore: true */ "/workers/mempool-worker.js"
      );

      workerRef.current.onmessage = (event) => {
        // The worker is sending us some data
        const { type, data, error } = event.data as {
          type: "CONNECTED" | "MESSAGE" | "ERROR" | "CLOSED" | "LOADED";
          data?: string;
          error?: string;
        };

        switch (type) {
          case "CONNECTED":
            setSocketStatus("Connected");
            break;
          case "MESSAGE":
            if (data) {
              const parsed = parseData(data);

              console.log(parsed);

              setMessages((prev) => [...prev, ...parsed]);
            }
            break;

          case "ERROR":
            console.error(error);
            setSocketStatus("Error");
            break;

          case "CLOSED":
            setSocketStatus("Disconnected");
            break;

          case "LOADED":
            // console.log("CONNECTING");
            // workerRef.current?.postMessage({ type: "CONNECT" });
            break;

          default:
            // ignore unknown
            break;
        }
      };
    }

    return () => {
      // Cleanup when component unmounts
      if (workerRef.current) {
        workerRef.current.postMessage({ type: "DISCONNECT" });
        workerRef.current.terminate();
      }
    };
  }, []);

  const handleConnect = () => {
    workerRef.current?.postMessage({ type: "CONNECT" });
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>WebSocket via TypeScript Web Worker in Next.js</h1>
      <p>Status: {socketStatus}</p>

      <button onClick={handleConnect} disabled={socketStatus === "Connected"}>
        Connect
      </button>

      <ul>
        {messages.map((msg, idx) => {
          console.log({ messages, msg });
          const number = stringToNumberInRange(msg.id, 0, 10);

          return (
            <li key={idx}>
              {number + " ---------- " + JSON.stringify(msg, null, 2)}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
