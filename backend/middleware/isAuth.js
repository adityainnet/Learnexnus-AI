import jwt from "jsonwebtoken";
const isAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.token;
    if (!token) {
      return res.status(400).json({ message: "Token is not found" });
    }
    let verifyToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!verifyToken) {
      return res.status(400).json({ message: "VerifyToken is not found" });
    }
    req.userId = verifyToken.userId;
    next();
  } catch (error) {
    return res.status(500).json({ message: `is Auth error ${error}` });
  }
};
export default isAuth;
