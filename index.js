const express = require("express");
const nunjucks = require("nunjucks");
const cookieParser = require("cookie-parser");
const WebSocket = require("ws");
const http = require("http");
const { findUserByToken } = require("./db");
const cookie = require("cookie");
const {
  addTimerHandle,
  stopTimerHandle,
  sendAllTimersMessage,
  sendActiveTimersMessage,
} = require("./timerHandlers");

const app = express();

nunjucks.configure("views", {
  autoescape: true,
  express: app,
  tags: {
    blockStart: "[%",
    blockEnd: "%]",
    variableStart: "[[",
    variableEnd: "]]",
    commentStart: "[#",
    commentEnd: "#]",
  },
});

app.set("view engine", "njk");

app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

app.use("/", require("./router/index"));

app.use((err, req, res, next) => {
  res.status(500).send(err.message);
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ clientTracking: false, noServer: true });
const clients = new Map();

server.on("upgrade", async (req, socket, hed) => {
  const cookies = cookie.parse(req.headers["cookie"]);
  const token = cookies?.["token"];

  try {
    const { id: userId } = await findUserByToken(token);

    if (!userId) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      return socket.destroy();
    }

    req.userId = userId;
    wss.handleUpgrade(req, socket, hed, (ws) => {
      wss.emit("connection", ws, req);
    });
  } catch (e) {
    socket.write("HTTP/1.1 403 Error during socket upgrading\r\n\r\n");
    socket.destroy();
  }
});

wss.on("connection", async (ws, req) => {
  const { userId } = req;

  clients.set(userId, ws);

  await sendAllTimersMessage(userId, ws);

  ws.on("close", () => {
    clients.delete(userId);
  });

  ws.on("message", (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (e) {
      return;
    }

    switch (data.type) {
      case "stop_timer":
        return stopTimerHandle(userId, data.id, ws);
      case "create_timer":
        return addTimerHandle(data.description, userId, ws);
    }
  });
});

function startSendActiveTimersInterval() {
  setInterval(async () => {
    for (const [userId, ws] of clients) {
      await sendActiveTimersMessage(userId, ws);
    }
  }, 1000);
}

startSendActiveTimersInterval();

server.listen(process.env.PORT, () => {
  console.log(`  Listening on http://localhost:${process.env.PORT}`);
});
