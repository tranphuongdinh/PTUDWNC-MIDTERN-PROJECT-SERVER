import jwt from "jsonwebtoken";
import { SECRET_TOKEN, STATUS } from "../constants/common.js";
import { BAD_REQUEST_STATUS_CODE, FORBIDDEN_STATUS_CODE, UNAUTHENTICATED_STATUS_CODE, UNAUTHENTICATED_STATUS_MESSAGE, FORBIDDEN_STATUS_MESSAGE } from "../constants/http-response.js";
import User from '../models/user.model.js'
import { APIResponse } from "../models/APIResponse.js";


const authenticationMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(UNAUTHENTICATED_STATUS_CODE).json({ message: UNAUTHENTICATED_STATUS_MESSAGE });
  }

  const token = authHeader.split(" ")[1];

  try {
    jwt.verify(token, SECRET_TOKEN, async (err, decodedToken) => {
      if (err) {
        return res.status(FORBIDDEN_STATUS_CODE).json({ message: err.message, data: [], code: STATUS.ERROR });
      } else {
        const owner = jwt.decode(token);
        let ownerUser = await User.findOne({ name: owner.user.name });
        if (ownerUser.isActive) {
          req.body.token = token;
          req.user = { ...decodedToken.user, access_token: token } || null;
          next();
        }
        else {
          return res.status(FORBIDDEN_STATUS_CODE).json(APIResponse(STATUS.ERROR, FORBIDDEN_STATUS_MESSAGE, 'Your account is not verified'))
        }
      }
    });
  } catch (err) {
    return res.status(BAD_REQUEST_STATUS_CODE).json({ message: err.message, data: [], code: STATUS.ERROR });
  }
};

export default authenticationMiddleware;
