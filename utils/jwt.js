import jwt from "jsonwebtoken";

//jwt token
const secretKey = process.env.JWT_SECRET || "abhishek@12345";
const createJWT = (payload) => {
  const data = jwt.sign(payload, secretKey, { expiresIn: "1d" });
  return data;
};

// token verification
const verifyJWT = (token) => {
  const data = jwt.verify(token, secretKey, (err, verified) => {
    if (err) {
      return false;
    }
    return verified;
  });
  return data;
};
export { createJWT, verifyJWT };
