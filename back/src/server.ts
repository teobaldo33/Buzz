import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { handleConnection } from "./connectionHandler.ts";
import RoomManager from "./roomManager.ts";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const roomManager = new RoomManager();

io.on("connection", (socket) => {
  handleConnection(io, socket, roomManager);
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
