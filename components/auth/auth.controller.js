import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../../models/user.model.js";

import { DEFAULT_PASSWORD, SECRET_TOKEN, STATUS } from "../../constants/common.js";
import { BAD_REQUEST_STATUS_CODE, INTERNAL_SERVER_STATUS_CODE, NOTFOUND_STATUS_CODE, SUCCESS_STATUS_CODE, SUCCESS_STATUS_MESSAGE, UNAUTHENTICATED_STATUS_CODE } from "../../constants/http-response.js";

import { GOOGLE_CLIENT_ID } from "../../constants/secret.js";

const getDecodedOAuthJwtGoogle = async (token) => {
  try {
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    return ticket?.payload || null;
  } catch (error) {
    return { status: 500, data: error };
  }
};

export const register = async (req, res) => {
  const { email, name, password } = req.body;
  try {
    const user = await User.findOne({
      email,
    });

    if (user) return res.status(BAD_REQUEST_STATUS_CODE).json({ status: STATUS.ERROR, message: "Email is used!", data: [] });

    const newPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      myGroupIds: [],
      joinedGroupIds: [],
      isActive: false,
    };

    await User.create({
      ...newUser,
      password: newPassword,
    });

    const access_token = jwt.sign(newUser, SECRET_TOKEN);

    return res.status(SUCCESS_STATUS_CODE).json({ status: STATUS.OK, message: SUCCESS_STATUS_MESSAGE, data: [{ ...newUser, access_token }] });
  } catch (err) {
    return res.status(NOTFOUND_STATUS_CODE).json({
      status: STATUS.ERROR,
      message: `Register failed: ${err}`,
      data: [],
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(UNAUTHENTICATED_STATUS_CODE).json({
        status: STATUS.ERROR,
        data: [],
        message: "Unauthorized",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      const access_token = jwt.sign({ user: user._doc }, SECRET_TOKEN);

      return res.status(SUCCESS_STATUS_CODE).json({
        status: STATUS.OK,
        message: SUCCESS_STATUS_MESSAGE,
        data: [
          {
            ...user._doc,
            access_token,
          },
        ],
      });
    } else {
      return res.status(BAD_REQUEST_STATUS_CODE).json({
        status: STATUS.ERROR,
        data: [],
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    res.status(INTERNAL_SERVER_STATUS_CODE).json({ status: STATUS.ERROR, data: [], message: error.message });
  }
};

export const loginWithGoogle = async (req, res) => {
  const { credential } = req.body;

  try {
    const data = await getDecodedOAuthJwtGoogle(credential);
    const { name, email } = data;

    const user = await User.findOne({
      email,
    });

    if (!user) {
      const newPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
      const newUser = {
        name,
        email,
        myGroupIds: [],
        joinedGroupIds: [],
        isActive: false,
      };

      await User.create({
        ...newUser,
        password: newPassword,
      });

      const access_token = jwt.sign(newUser, SECRET_TOKEN);
      return res.status(SUCCESS_STATUS_CODE).json({ status: STATUS.OK, message: SUCCESS_STATUS_MESSAGE, data: [{ ...newUser, access_token }] });
    } else {
      const access_token = jwt.sign({ user: user._doc }, SECRET_TOKEN);
      return res.status(SUCCESS_STATUS_CODE).json({
        status: STATUS.OK,
        message: SUCCESS_STATUS_MESSAGE,
        data: [
          {
            ...user._doc,
            access_token,
          },
        ],
      });
    }
  } catch (err) {
    return res.status(BAD_REQUEST_STATUS_CODE).json({ message: err.message, data: [], status: STATUS.ERROR });
  }
};
