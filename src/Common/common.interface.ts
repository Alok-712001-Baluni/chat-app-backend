import { Request } from "express";

interface IRequest extends Request {
    user: any;
    params: any;
}

interface IJwtPayload {
    id: string
}

export { IRequest, IJwtPayload };