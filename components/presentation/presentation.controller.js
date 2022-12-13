import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "../../config/email/emailService.js";
import { STATUS } from "../../constants/common.js";
import {
  BAD_REQUEST_STATUS_CODE,
  BAD_REQUEST_STATUS_MESSAGE,
  FORBIDDEN_STATUS_CODE,
  FORBIDDEN_STATUS_MESSAGE,
  INTERNAL_SERVER_STATUS_CODE,
  INTERNAL_SERVER_STATUS_MESSAGE,
  NOTFOUND_STATUS_CODE,
  NOTFOUND_STATUS_MESSAGE,
  SUCCESS_STATUS_CODE,
  SUCCESS_STATUS_MESSAGE,
} from "../../constants/http-response.js";
import { APIResponse } from "../../models/APIResponse.js";
import groupModel from "../../models/group.model.js";
import userModel from "../../models/user.model.js";
import dotenv from "dotenv";
import presentationModel from "../../models/presentation.model.js";
dotenv.config();
// Interact Data

export const presentationDetail = async (req, res) => {
  const id = req.param("id")
  try {
    const presentation = await presentationModel.findById(id);
    return res.status(SUCCESS_STATUS_CODE).json(APIResponse(STATUS.OK, "Get presentation detail successfully", presentation));
  } catch (error) {
    return res.status(INTERNAL_SERVER_STATUS_CODE).json(APIResponse(STATUS.ERROR, NOTFOUND_STATUS_MESSAGE, []));
  }
};

export const createPresentation = async (req, res) => {
  const { name, groupId } = req.body;
  const user = req.user;

  //Check name exists
  try {
    const existPresentation = await presentationModel.findOne({ name });
    if (existPresentation) {
      return res.status(BAD_REQUEST_STATUS_CODE).json(APIResponse(STATUS.ERROR, "Your presentation name is already existed"));
    }
  } catch (error) {
    return res.status(INTERNAL_SERVER_STATUS_CODE).json(APIResponse(STATUS.ERROR, INTERNAL_SERVER_STATUS_MESSAGE, error.message));
  }

  const data = {
    name,
    ownerId: user._id,
    isPublic: groupId ? false : true,
    isPresent: false,
    slides: [],
    groupId,
  }

  if (!groupId) delete data.groupId

  const newPresentation = new presentationModel(data);

  try {
    await newPresentation.save();
    const owner = await userModel.findById(user._id);
    owner.presentationIds.push(newPresentation);
    await owner.save();
  } catch (error) {
    return res.status(INTERNAL_SERVER_STATUS_CODE).json(APIResponse(STATUS.ERROR, INTERNAL_SERVER_STATUS_MESSAGE, error.message));
  }

  //ALl SUCCESS
  return res.status(SUCCESS_STATUS_CODE).json(APIResponse(STATUS.OK, newPresentation));
};

export const updatePresentation = async (req, res) => {
  const { _id, name, isPublic, isPresent, slides, groupId } = req.body;
  const user = req.user;

  let existPresentation;
  //Check name exists
  try {
    existPresentation = await presentationModel.findById(_id);
    if (!existPresentation) {
      return res.status(NOTFOUND_STATUS_CODE).json(APIResponse(STATUS.ERROR, NOTFOUND_STATUS_MESSAGE, "Presentation not found"));
    }
  } catch (error) {
    return res.status(INTERNAL_SERVER_STATUS_CODE).json(APIResponse(STATUS.ERROR, INTERNAL_SERVER_STATUS_MESSAGE, error.message));
  }

  //Check owner of presentation
  if (!existPresentation.ownerId.equals(user._id)) {
    return res.status(FORBIDDEN_STATUS_CODE).json(APIResponse(STATUS.ERROR, FORBIDDEN_STATUS_MESSAGE, "You are not allowed"));
  }

  existPresentation.name = name || existPresentation.name;
  existPresentation.isPublic = typeof isPublic === "boolean" ? isPublic : existPresentation.isPublic;
  existPresentation.isPresent = typeof isPresent === "boolean" ? isPresent : existPresentation.isPresent;
  existPresentation.slides = slides || existPresentation.slides;
  existPresentation.groupId = groupId || existPresentation.groupId;

  try {
    await existPresentation.save();
  } catch (error) {
    return res.status(INTERNAL_SERVER_STATUS_CODE).json(APIResponse(STATUS.ERROR, INTERNAL_SERVER_STATUS_MESSAGE, error.message));
  }

  //ALl SUCCESS
  return res.status(SUCCESS_STATUS_CODE).json(APIResponse(STATUS.OK, SUCCESS_STATUS_MESSAGE, existPresentation));
};

export const deletePresentaion = async (req, res) => {
  const { id } = req.body;
  const user = req.user;

  let existPresentation;
  //Check name exists
  try {
    existPresentation = await presentationModel.findById(id);
    if (!existPresentation) {
      return res.status(NOTFOUND_STATUS_CODE).json(APIResponse(STATUS.ERROR, NOTFOUND_STATUS_MESSAGE, "Presentation not found"));
    }
  } catch (error) {
    return res.status(INTERNAL_SERVER_STATUS_CODE).json(APIResponse(STATUS.ERROR, INTERNAL_SERVER_STATUS_MESSAGE, error.message));
  }

  //Check owner of presentation
  if (!existPresentation.ownerId.equals(user._id)) {
    return res.status(FORBIDDEN_STATUS_CODE).json(APIResponse(STATUS.ERROR, FORBIDDEN_STATUS_MESSAGE, "You are not allowed"));
  }

  try {
    await existPresentation.remove();
  } catch (error) {
    return res.status(INTERNAL_SERVER_STATUS_CODE).json(APIResponse(STATUS.ERROR, INTERNAL_SERVER_STATUS_MESSAGE, error.message));
  }

  //ALL SUCCESS
  return res.status(SUCCESS_STATUS_CODE).json(APIResponse(STATUS.OK, SUCCESS_STATUS_MESSAGE, "Remove successfully"));
};

export const getPresentationByIds = async (req, res) => {
  try {
    if (req.user) {
      const { ids = [] } = req.body;

      const presentationList = await presentationModel.find({
        _id: {
          $in: ids,
        },
      });

      return res.status(SUCCESS_STATUS_CODE).json({
        status: STATUS.OK,
        data: presentationList,
        message: "Get presentation list successfully",
      });
    } else {
      return res.status(NOTFOUND_STATUS_CODE).json({
        status: STATUS.ERROR,
        data: [],
        message: "Not found",
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
