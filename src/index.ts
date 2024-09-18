import express, { type Application } from "express";
import { type Socket, type ServerOptions } from "socket.io";
import { type Seen, type Online, type Data, type Typing } from "./types";
import * as http from "http";
// import { CorsOptions } from "cors";
// import { Server} from "socket.io";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";
const app: Application = express();

// const http = require("http");
// const cors = require("cors");
// const { Server } = require("socket.io");
const PORT = process.env.PORT || 5001;
app.use(cors());
const server = http.createServer(app);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const ioOptions: Partial<ServerOptions> = {
  cors: {
    // origin: "http://localhost:3000",
    origin: "https://workers-chatapp-frontend.vercel.app",
    methods: ["GET", "POST"],
  },
};

const io: SocketIOServer = new SocketIOServer(server, ioOptions);

app.get("/", (req, res) => res.send("Hello World!"));

let online_Users: Online[] = [];

io.on("connection", (socket: Socket) => {
  socket.on("new-online", (newEmail: string) => {
    if (!online_Users.some((user) => user.email === newEmail)) {
      online_Users.push({
        email: newEmail,
        socketId: socket.id,
        socket: socket,
        typing: false,
        personWhoIamTypingTo: "",
      });
      io.emit(
        "get-users",
        online_Users.map((i) => ({ email: i.email, socketId: i.socketId }))
      );
    }
  });

  socket.on("typing", (email: Typing) => {
    io.emit(
      "get-users",
      online_Users.map((i) => {
        if (i.email === email.senderEmail) {
          return {
            email: i.email,
            sockedId: i.socketId,
            typing: true,
            personWhoIamTypingTo: email.email,
          };
        } else {
          return { email: i.email, sockedId: i.socketId };
        }
      })
    );
    console.log(online_Users)
  });

  socket.on("all-is-seen", ({ receiver }) => {
    io.emit("seen", receiver);
  });
  socket.on("reciever-seen", ({ receiverEmail, senderEmail }: Seen) => {
    io.emit("now-seen-all", {
      receiverEmail,
      senderEmails: senderEmail,
    });
  });

  socket.on("stop-typing", (email: string) => {
    io.emit(
      "get-users",
      online_Users.map((i) => {
        if (i.email === email) {
          return { email: i.email, sockedId: i.socketId, typing: false, personWhoIamTypingTo: "" };
        } else {
          return { email: i.email, sockedId: i.socketId };
        }
      })
    );
  });

  socket.on("get-users", (email: string) => {
    const getWhoJusJoinedEmail = online_Users.find((i) => i.email === email);
    getWhoJusJoinedEmail?.socket?.emit(
      "get-users",
      online_Users.map((i) => ({ email: i.email, socketId: i.socketId }))
    );
  });

  socket.on("sentMessage", (data: Data) => {
    data.status = "delivered";
    if (online_Users.some((i) => i.email === data.receiverEmail)) {
      const getSenderEmail = online_Users.find((i) => i.email === data.senderEmail);
      getSenderEmail?.socket?.emit("sentMessageFromServer", {
        data,
      });
      const getRecieverEmail = online_Users.find((i) => i.email === data.receiverEmail);
      getRecieverEmail?.socket?.emit("sentMessageFromServer", {
        data,
      });
    }
    io.emit(
      "get-users",
      online_Users.map((i) => ({ email: i.email, socketId: i.socketId }))
    );
  });

  socket.on("disconnect", () => {
    io.emit(
      "get-users",
      online_Users
        .filter((i) => i.socketId !== socket.id)
        .map((j) => ({ email: j.email, socketId: j.socketId }))
    );
    online_Users = online_Users.filter((i) => i.socketId !== socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server up at PORT:${PORT}`);
});
