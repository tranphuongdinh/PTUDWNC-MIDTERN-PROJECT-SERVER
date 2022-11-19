import { SUCCESS_STATUS_CODE, NOTFOUND_STATUS_CODE } from "../../constants/http-response.js";
import { STATUS } from "../../constants/common.js";

export const getCurrentUser = (req, res) => {
  if (req.user) {
    return res.status(SUCCESS_STATUS_CODE).json({
      code: STATUS.OK,
      data: [user],
      message: "Get user successfully",
    });
  } else {
    return res.status(NOTFOUND_STATUS_CODE).json({
      code: STATUS.ERROR,
      data: [],
      message: "User not found",
    });
  }
};
