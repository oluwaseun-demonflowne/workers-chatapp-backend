import { type Socket } from "socket.io";

export type Online = {
  email: string;
  socketId: string;
  socket:Socket
  typing:boolean
}

export type newSocket = Socket & {
  id: string;
};

export type Data = {
  receiverEmail: string;
  senderEmail: string;
  chatId: number;
  message: string;
  image: string[];
  status: "sent" | "read" | "delivered";
};

export type Seen = {
  receiverEmail: string;
  senderEmail: string;
};