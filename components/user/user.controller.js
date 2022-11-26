import { STATUS } from "../../constants/common.js";
import { NOTFOUND_STATUS_CODE, SUCCESS_STATUS_CODE } from "../../constants/http-response.js";
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
      await userModel.findOneAndUpdate({ email: req.user.email }, { ...req.user, ...req.body });
      const updatedUser = await userModel.findOne({ email: req.user.email });
      return res.status(SUCCESS_STATUS_CODE).json({
        status: STATUS.OK,
        data: [updatedUser],
        message: "Update user successfully",
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
      message: e,
    });
  }
};
