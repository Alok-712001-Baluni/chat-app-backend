import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Server } from "socket.io";
import { connectToDB } from './src/Config';
import { notFound, errorHandler } from './src/Middleware';
dotenv.config();
import userRoutes from './src/User/user.controller';
import messageRoutes from './src/Message/message.controller';
import chatRoutes from './src/Chat/chat.controller';

const app: Express = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT;

connectToDB();

app.use('/api/user', userRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/chat', chatRoutes);

app.use(notFound); // Handle invalid routes
app.use(errorHandler);

const server = app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
    },
    pingTimeout: 60 * 1000,
});

io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User joined room " + room);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));

    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageRecieved) => {
        let chat = newMessageRecieved.chat[0]; // Change it to object

        if (!chat.users) return console.log("chat.users not defined");

        chat.users.forEach((user: any) => {
            if (user._id === newMessageRecieved.sender._id) return;

            socket.in(user._id).emit("message recieved", newMessageRecieved);
        });
    });

    socket.off("setup", (userData) => {
        console.log("User Disconnected");
        socket.leave(userData._id);
    });
});


