import { protect } from "./authMiddleware";
import { notFound, errorHandler } from "./errorMiddleware";

export {
    protect,
    notFound,
    errorHandler
};