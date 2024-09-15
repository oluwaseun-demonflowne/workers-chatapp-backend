"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http = __importStar(require("http"));
// import { CorsOptions } from "cors";
// import { Server} from "socket.io";
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
// const http = require("http");
// const cors = require("cors");
// const { Server } = require("socket.io");
const PORT = process.env.PORT || 5001;
app.use((0, cors_1.default)());
const server = http.createServer(app);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const ioOptions = {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
};
const io = new socket_io_1.Server(server, ioOptions);
app.get("/", (req, res) => res.send("Hello World!"));
let online_Users = [];
io.on("connection", (socket) => {
    socket.on("new-online", (newEmail) => {
        if (!online_Users.some((user) => user.email === newEmail)) {
            online_Users.push({ email: newEmail, socketId: socket.id, socket: socket, typing: false });
            io.emit("get-users", online_Users.map((i) => ({ email: i.email, socketId: i.socketId })));
        }
    });
    socket.on("typing", (email) => {
        io.emit("get-users", online_Users.map((i) => {
            if (i.email === email) {
                return { email: i.email, sockedId: i.socketId, typing: true };
            }
            else {
                return { email: i.email, sockedId: i.socketId };
            }
        }));
    });
    socket.on("all-is-seen", ({ receiver }) => {
        io.emit("seen", receiver);
    });
    socket.on("reciever-seen", ({ receiverEmail, senderEmail }) => {
        io.emit("now-seen-all", {
            receiverEmail,
            senderEmails: senderEmail,
        });
    });
    socket.on("stop-typing", (email) => {
        io.emit("get-users", online_Users.map((i) => {
            if (i.email === email) {
                return { email: i.email, sockedId: i.socketId, typing: false };
            }
            else {
                return { email: i.email, sockedId: i.socketId };
            }
        }));
    });
    socket.on("get-users", (email) => {
        var _a;
        const getWhoJusJoinedEmail = online_Users.find((i) => i.email === email);
        (_a = getWhoJusJoinedEmail === null || getWhoJusJoinedEmail === void 0 ? void 0 : getWhoJusJoinedEmail.socket) === null || _a === void 0 ? void 0 : _a.emit("get-users", online_Users.map((i) => ({ email: i.email, socketId: i.socketId })));
    });
    socket.on("sentMessage", (data) => {
        var _a, _b;
        data.status = "delivered";
        if (online_Users.some((i) => i.email === data.receiverEmail)) {
            const getSenderEmail = online_Users.find((i) => i.email === data.senderEmail);
            (_a = getSenderEmail === null || getSenderEmail === void 0 ? void 0 : getSenderEmail.socket) === null || _a === void 0 ? void 0 : _a.emit("sentMessageFromServer", {
                data,
            });
            const getRecieverEmail = online_Users.find((i) => i.email === data.receiverEmail);
            (_b = getRecieverEmail === null || getRecieverEmail === void 0 ? void 0 : getRecieverEmail.socket) === null || _b === void 0 ? void 0 : _b.emit("sentMessageFromServer", {
                data,
            });
        }
        io.emit("get-users", online_Users.map((i) => ({ email: i.email, socketId: i.socketId })));
    });
    socket.on("disconnect", () => {
        io.emit("get-users", online_Users
            .filter((i) => i.socketId !== socket.id)
            .map((j) => ({ email: j.email, socketId: j.socketId })));
        online_Users = online_Users.filter((i) => i.socketId !== socket.id);
    });
});
server.listen(PORT, () => {
    console.log(`Server up at PORT:${PORT}`);
});
