import bcrypt from "bcryptjs";
import { STATUS } from "../../constants/common.js";
import { BAD_REQUEST_STATUS_CODE, NOTFOUND_STATUS_CODE, SUCCESS_STATUS_CODE } from "../../constants/http-response.js";
import userModel from "../../models/user.model.js";

export const getCurrentUser = async (req, res) => {
  if (req.user) {
    return res.status(SUCCESS_STATUS_CODE).json({
      status: STATUS.OK,
      data: [req.user],
      message: "Get user successfully",
    });
  } else {
    return res.status(NOTFOUND_STATUS_CODE).json({
      status: STATUS.ERROR,
      data: [],
      message: "User not found",
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    if (req.user) {
      const { name, password, newPassword } = req.body;

      const isPasswordValid = await bcrypt.compare(password, req.user.password);

      if (isPasswordValid) {
        const newPasswordHashed = await bcrypt.hash(newPassword, 10);
        await userModel.findOneAndUpdate({ email: req.user.email }, { ...req.user, name, password: newPasswordHashed });
        const updatedUser = await userModel.findOne({ email: req.user.email });

        return res.status(SUCCESS_STATUS_CODE).json({
          status: STATUS.OK,
          data: [updatedUser],
          message: "Update user successfully",
        });
      } else {
        return res.status(BAD_REQUEST_STATUS_CODE).json({
          status: STATUS.ERROR,
          data: [],
          message: "Invalid password",
        });
      }
    } else {
      return res.status(NOTFOUND_STATUS_CODE).json({
        status: STATUS.ERROR,
        data: [],
        message: "User not found",
      });
    }
  } catch (e) {
    return res.status(NOTFOUND_STATUS_CODE).json({
      status: STATUS.ERROR,
      data: [],
      message: e.message,
    });
  }
};

export const getUserByIds = async (req, res) => {
  try {
    if (req.user) {
      const { ids = [] } = req.body;

      const userList = await userModel.find({
        _id: {
          $in: ids,
        },
      });

      return res.status(SUCCESS_STATUS_CODE).json({
        status: STATUS.OK,
        data: userList.map(({ _id, name, email }) => ({ _id, name, email })),
        message: "Get user list successfully",
      });
    } else {
      return res.status(NOTFOUND_STATUS_CODE).json({
        status: STATUS.ERROR,
        data: [],
        message: "User not found",
      });
    }
  } catch (e) {
    return res.status(NOTFOUND_STATUS_CODE).json({
      status: STATUS.ERROR,
      data: [],
      message: e.message,
    });
  }
};
