import { NextFunction, Request, Response } from "express";
import { IRequest, IJwtPayload } from "../Common/common.interface";
import jwt from "jsonwebtoken";
import User from "../User/user.schema";
import { env } from 'process';

export const protect = async (req: IRequest, res: Response, next: NextFunction) => {
    let token;

    // If 'authorization' header present and starts Wwth 'Bearer' word
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1]; // Splits "Bearer <TOKEN>"

            //decodes token id
            const { id } = jwt.verify(token, env.JWT_SECRET ?? '') as IJwtPayload;

            // Find user with the id and return it without the password
            req.user = await User.findById(id).select("-password");

            next(); // Move on to next operation
        } catch (error) {
            return res.status(401).json({
                success: false,
                statusCode: 401,
                message: "Not authorized, token failed",
            });
        }
    }

    // If token is not present
    if (!token) {
        return res.status(401).json({
            success: false,
            statusCode: 401,
            message: "Not authorized, no token provided",
        });
    }
};
