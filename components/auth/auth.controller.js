import User from '../../models/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { SECRET_TOKEN, STATUS } from '../../constants/common.js';
import {
  BAD_REQUEST_STATUS_CODE,
  INTERNAL_SERVER_STATUS_CODE,
  NOTFOUND_STATUS_CODE,
  NOTFOUND_STATUS_MESSAGE,
  SUCCESS_STATUS_CODE,
  SUCCESS_STATUS_MESSAGE,
} from '../../constants/http-response.js';

export const register = async (req, res) => {
  const { email, name, password } = req.body;
  try {
    const user = await User.findOne({
      email,
    });

    if (user)
      return res
        .status(BAD_REQUEST_STATUS_CODE)
        .json({ status: STATUS.ERROR, message: 'Email is used!' });

    const newPassword = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      password: newPassword,
      myGroupIds: [],
      joinedGroupIds: [],
      isActive: false
    });

    return res
      .status(SUCCESS_STATUS_CODE)
      .json({ status: STATUS.OK, message: SUCCESS_STATUS_MESSAGE });
  } catch (err) {
    return res.status(NOTFOUND_STATUS_CODE).json({
      status: STATUS.ERROR,
      message: `Register failed: ${err}`,
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
      return res
        .status(NOTFOUND_STATUS_CODE)
        .json({
          status: STATUS.ERROR,
          user: false,
          message: 'Invalid email or password',
        });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      const token = jwt.sign(
        {
          name: user.name,
          email,
        },
        SECRET_TOKEN
      );

      return res
        .status(SUCCESS_STATUS_CODE)
        .json({
          status: STATUS.OK,
          message: SUCCESS_STATUS_MESSAGE,
          user: token,
        });
    } else {
      return res.status(NOTFOUND_STATUS_CODE).json({
        status: STATUS.ERROR,
        user: false,
        message: 'Invalid email or password',
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(INTERNAL_SERVER_STATUS_CODE)
      .json({ status: STATUS.ERROR, user: false, message: error.message });
  }
};
