let socket;

self.onmessage = (event) => {
  const { type } = event.data;

  switch (type) {
    case "CONNECT": {
      if (socket) {
        socket.close();
      }

      socket = new WebSocket("wss://mempool.space/api/v1/ws");

      socket.onopen = () => {
        socket.send(JSON.stringify({ action: "want", data: ["blocks"] }));
        postMessage({ type: "CONNECTED" });
      };

      socket.onmessage = (msg) => {
        postMessage({ type: "MESSAGE", data: msg.data });
      };

      socket.onerror = (error) => {
        postMessage({ type: "ERROR", error });
      };

      socket.onclose = () => {
        postMessage({ type: "CLOSED" });
      };
      break;
    }

    case "DISCONNECT": {
      if (socket) {
        socket.close();
        socket = null;
      }
      break;
    }

    default:
      console.warn("Unknown event type in worker:", type);
  }
};

self.postMessage({ type: "LOADED" });
