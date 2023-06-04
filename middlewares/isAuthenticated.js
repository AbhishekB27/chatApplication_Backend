import { verifyJWT } from "../utils/jwt.js";

const isAuthenticated = (req, res, next) => {
  let message = {
    success: false,
    data: null,
    message: "",
  };
  const bearerToken = req.headers["x-access-token"] || req.headers["Authorization"];
  const token = bearerToken && bearerToken.split(" ")[1];
  try {
    if (!token) {
      message = {
        success: false,
        data: null,
        message: "Access token not found",
      };
      return res.status(403).send(message);
    }
    const tokenVerification = verifyJWT(token);
    if (tokenVerification) {
      req.user = tokenVerification;
      next();
    } else {
      message = {
        success: false,
        data: null,
        message: "Token Expired",
      };
      return res.status(440).send(message);
    }
  } catch (error) {
    message = {
      success: false,
      data: null,
      message: error.message,
    };
    return res.send(message);
  }
};

export default isAuthenticated;
