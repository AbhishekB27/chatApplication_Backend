import bcrypt from "bcrypt";
const hashedPassword = async (passowrd, strength = 5) => {
  try {
    const salt = await bcrypt.genSalt(strength);
    const hashed = await bcrypt.hash(passowrd, salt);
    return hashed;
  } catch (error) {
    console.log(error.message);
  }
};

const verifyPassword = (dbPass, userPass) => {
  try {
    const verify = bcrypt.compareSync(userPass,dbPass);
    return verify;
  } catch (error) {
    console.log(error.message);
  }
};
export { hashedPassword, verifyPassword };