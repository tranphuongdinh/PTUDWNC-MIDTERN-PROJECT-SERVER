import jwt from "jsonwebtoken";
import { SECRET_TOKEN, STATUS } from "../constants/common.js";
import { BAD_REQUEST_STATUS_CODE, FORBIDDEN_STATUS_CODE, UNAUTHENTICATED_STATUS_CODE, UNAUTHENTICATED_STATUS_MESSAGE } from "../constants/http-response.js";

const authenticationMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(UNAUTHENTICATED_STATUS_CODE).json({ message: UNAUTHENTICATED_STATUS_MESSAGE });
  }

  const token = authHeader.split(" ")[1];

  try {
    jwt.verify(token, SECRET_TOKEN, (err, decodedToken) => {
      if (err) {
        return res.status(FORBIDDEN_STATUS_CODE).json({ message: err.message, data: [], code: STATUS.ERROR });
      } else {
        req.body.token = token;
        req.user = { ...decodedToken.user, access_token: token } || null;
        next();
      }
    });
  } catch (err) {
    return res.status(BAD_REQUEST_STATUS_CODE).json({ message: err.message, data: [], code: STATUS.ERROR });
  }
};

export default authenticationMiddleware;
