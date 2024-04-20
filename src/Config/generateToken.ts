import jwt from "jsonwebtoken";
import { env } from "process";

const generateToken = (id: Object, email: string) => {
    return jwt.sign({ id, email }, env.JWT_SECRET ?? '', { expiresIn: process.env.JWT_EXPIRE });
};

export default generateToken;
