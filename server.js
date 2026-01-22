const WebSocket = require("ws");

const port = process.env.PORT || 8081;
const wss = new WebSocket.Server({ port });

let nextId = 1;
const clients = new Map(); // id -> ws

wss.on("connection", (ws) => {
  const id = String(nextId++);
  clients.set(id, ws);

  // 接続時に init を返す（今いる全員のID一覧）
  const connected = Array.from(clients.keys());
  ws.send(JSON.stringify({ type: "init", id, connected }));

  ws.on("message", (data) => {
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      return;
    }

    // to が指定されてたら、その相手に転送
    if (msg.to && clients.has(String(msg.to))) {
      clients.get(String(msg.to)).send(JSON.stringify(msg));
    }
  });

  ws.on("close", () => {
    clients.delete(id);
  });
});

console.log(`Signaling server running on port ${port}`);
