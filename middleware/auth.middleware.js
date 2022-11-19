import jwt from 'jsonwebtoken'
import { SECRET_TOKEN } from '../constants/common.js';
import { FORBIDDEN_STATUS_CODE, UNAUTHENTICATED_STATUS_CODE, UNAUTHENTICATED_STATUS_MESSAGE } from '../constants/http-response.js';

const authenticationMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(UNAUTHENTICATED_STATUS_CODE).json({ message: UNAUTHENTICATED_STATUS_MESSAGE });
  }

  const token = authHeader.split(' ')[1];

  try {
    jwt.verify(token, SECRET_TOKEN, (err, decodedToken) => {
      if (err) {
        return res
          .status(FORBIDDEN_STATUS_CODE)
          .json({ message: err.message });
      } else {
        req.body.token = token
        next();
      }
    });
  } catch (error) {
    throw new Error('Not authorized to access this route');
  }
};

export default authenticationMiddleware;
