import Chat from './chat.schema';
import User from '../User/user.schema';

import { Request, Response, NextFunction } from 'express';
import { IRequest } from 'Common/common.interface';

// @description     Create or fetch One to One Chat
// @route           POST /api/chat/
// @access          Protected

const accessChat = async (req: IRequest, res: Response) => {
    const { userId } = req.body;

    // If chat with 'userId' not present in request
    if (!userId) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "UserId param not sent with request",
        });
    }

    let chatExists: any = await Chat.find({
        isGroupChat: false, // 'isGroupChat' will be false as it is one-to-one chat
        // logged in user's id and the user id we sent should be same in the 'users' array
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } },
        ],
    })
        .populate("users", "-password") // Return 'users' without 'password'
        .populate("latestMessage"); // Return 'latestMessage'

    chatExists = await User.populate(chatExists, {
        path: "latestMessage.sender",
        select: "name pic email", // Fields we want to populate
    });

    // Check if chat exists, else create a new chat
    if (chatExists.length > 0) {
        return res.status(200).send(chatExists[0]);
    } else {
        let newChatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        };

        try {
            const createdChat = await Chat.create(newChatData);
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
                "users",
                "-password"
            );
            res.status(200).json(FullChat);
        } catch (error: any) {
            res.status(400).json({
                success: false,
                statusCode: 400,
                message: error.message,
            });
        }
    }
};

// @description     Fetch all chats for a user
// @route           GET /api/chat/
// @access          Protected
const fetchChats = async (req: IRequest, res: Response) => {
    try {
        let results: any = await Chat.find({
            users: { $elemMatch: { $eq: req.user._id } },
        })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 })
            .exec();

        results = await User.populate(results, {
            path: "latestMessage.sender",
            select: "name pic email",
        });

        return res.status(200).send(results);
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: error.message,
        });
    }
};

// @description     Create New Group Chat
// @route           POST /api/chat/group
// @access          Protected
const createGroupChat = async (req: IRequest, res: Response) => {
    // If any of them is missing
    if (!req.body.users || !req.body.name) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Please Fill all the feilds",
        });
    }

    let users = JSON.parse(req.body.users);

    if (users.length < 2) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "More than 2 users are required to form a group chat",
        });
    }

    // If current user not present in users array
    if (!users.includes(req.user._id.toString())) {
        users.push(req.user); // Add current user along with all the people
    }

    try {
        //ts-ignore
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users,
            isGroupChat: true,
            groupAdmin: req.user, // As current user is creating the group
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        return res.status(200).json(fullGroupChat);
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: error.message,
        });
    }
};

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
const renameGroup = async (req: IRequest, res: Response) => {
    const { chatId, chatName } = req.body;

    try {
        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            {
                chatName: chatName,
            },
            {
                new: true,
            }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!updatedChat) {
            return res.status(404).json({
                success: false,
                statusCode: 404,
                message: "Chat Not Found",
            });
        } else {
            return res.status(200).json(updatedChat);
        }
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            statusCode: 404,
            message: error.message,
        });
    }
};

// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
const addToGroup = async (req: IRequest, res: Response) => {
    const { chatId, userId } = req.body;

    // Check if the requester is admin
    const isAdmin = await Chat.findOne({ groupAdmin: req.user._id }).exec();
    if (!isAdmin) {
        return res.status(401).json({
            success: false,
            statusCode: 401,
            message: "You are not authorized",
        });
    }

    const added = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: { users: userId },
        },
        {
            new: true,
        }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!added) {
        return res.status(404).json({
            success: false,
            statusCode: 404,
            message: "Chat Not Found",
        });
    } else {
        return res.status(200).json(added);
    }
};

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
const removeFromGroup = async (req: IRequest, res: Response) => {
    const { chatId, userId } = req.body;

    // Check if the requester is admin
    const isAdmin = await Chat.findOne({ groupAdmin: req.user._id }).exec();
    if (!isAdmin) {
        return res.status(401).json({
            success: false,
            statusCode: 401,
            message: "You are not authorized",
        });
    }

    const removed = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: { users: userId },
        },
        {
            new: true,
        }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!removed) {
        return res.status(404).json({
            success: false,
            statusCode: 404,
            message: "Chat Not Found",
        });
    } else {
        return res.status(200).json(removed);
    }
};

const leaveGroup = async (req: IRequest, res: Response) => {
    const { chatId, userId } = req.body;

    const removed = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: { users: userId },
        },
        {
            new: true,
        }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!removed) {
        return res.status(404).json({
            success: false,
            statusCode: 404,
            message: "Chat Not Found",
        });
    } else {
        return res.status(200).json(removed);
    }
};

export {
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    leaveGroup,
    addToGroup,
    removeFromGroup,
};
