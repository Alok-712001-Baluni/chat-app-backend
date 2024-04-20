import mongoose from "mongoose";
import { env } from "process";

const connectToDB = async () => {
    try {
        await mongoose.connect(env.MONGO_URI ?? '');
        console.log("MongoDB connected!!");
    } catch (error) {
        console.log(">>>Failed to connect to MongoDB:", error);
    }
};

export default connectToDB;
