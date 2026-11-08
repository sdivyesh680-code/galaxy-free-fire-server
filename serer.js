
const WebSocket = require("ws");

const PORT = process.env.PORT || 3000;
const wss = new WebSocket.Server({ port: PORT });

const players = new Map();

wss.on("connection", (ws) => {
  const id = Math.random().toString(36).slice(2, 10);

  players.set(id, {
    x: 0,
    y: 0,
    z: 0
  });

  ws.send(JSON.stringify({
    type: "welcome",
    id
  }));

  function sendPlayers() {
    const data = JSON.stringify({
      type: "players",
      players: Array.from(players.entries())
    });

    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  }

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "move") {
        players.set(id, {
          x: Number(data.x) || 0,
          y: Number(data.y) || 0,
          z: Number(data.z) || 0
        });

        sendPlayers();
      }
    } catch (error) {
      console.log("Invalid message");
    }
  });

  ws.on("close", () => {
    players.delete(id);
    sendPlayers();
  });

  sendPlayers();
});

console.log("GALAXY FREE FIRE SERVER READY");
