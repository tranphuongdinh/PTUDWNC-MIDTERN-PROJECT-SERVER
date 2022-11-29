import bcrypt from "bcryptjs";
import { sendEmail } from "../../config/email/emailService.js";
import { STATUS } from "../../constants/common.js";
import { BAD_REQUEST_STATUS_CODE, NOTFOUND_STATUS_CODE, SUCCESS_STATUS_CODE } from "../../constants/http-response.js";
import userModel from "../../models/user.model.js";

export const sendVerificationEmail = async (req, res) => {
  try {
    if (req.user) {
      const user = req.user;

      sendEmail(
        process.env.EMAIL_HOST,
        user.email,
        "Verified your account",
        `<p> Please click to this link to verify your account: <a href="${process.env.CLIENT_DOMAIN}/active?userId=${user._id}&activeCode=${user.activeCode}">${process.env.CLIENT_DOMAIN}/active?userId=${user._id}&activeCode=${user.activeCode}</a> </p>`
      );

      return res.status(SUCCESS_STATUS_CODE).json({
        status: STATUS.OK,
        data: [],
        message: "The verification email has been sent",
      });
    } else {
      return res.status(NOTFOUND_STATUS_CODE).json({
        status: STATUS.ERROR,
        data: [],
        message: "Can not send verification email",
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

export const getCurrentUser = async (req, res) => {
  try {
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
  } catch (e) {
    return res.status(NOTFOUND_STATUS_CODE).json({
      status: STATUS.ERROR,
      data: [],
      message: e,
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
