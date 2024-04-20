import bcrypt from "bcryptjs";

const verifyPassword = async (enteredPassword: string, existingPassword: string) => {
    // Returns True if the password entered by the user matches
    return await bcrypt.compare(enteredPassword, existingPassword);
};

export default verifyPassword;
