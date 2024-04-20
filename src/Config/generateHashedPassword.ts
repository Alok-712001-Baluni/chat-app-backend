import bcrypt from "bcryptjs";

const generateHashedPassword = async (password: string) => {
    //  Hashing the password
    const salt = await bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword;
};

export default generateHashedPassword;
