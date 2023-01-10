import dotenv from "dotenv";
import { STATUS } from "../../constants/common.js";
import {
  BAD_REQUEST_STATUS_CODE,
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
import presentationModel from "../../models/presentation.model.js";
import questionModel from "../../models/question.model.js";
import userModel from "../../models/user.model.js";
dotenv.config();
// Interact Data

export const presentationDetail = async (req, res) => {
  const id = req.param("id");
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
    slides: JSON.stringify([]),
    groupId,
  };

  if (!groupId) delete data.groupId;

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
  if (!existPresentation.ownerId.equals(user._id) && !existPresentation.collaborators.includes(user._id)) {
    return res.status(FORBIDDEN_STATUS_CODE).json(APIResponse(STATUS.ERROR, FORBIDDEN_STATUS_MESSAGE, "You are not allowed"));
  }

  existPresentation.name = name || existPresentation.name;
  existPresentation.isPublic = typeof isPublic === "boolean" ? isPublic : existPresentation.isPublic;
  existPresentation.isPresent = typeof isPresent === "boolean" ? isPresent : existPresentation.isPresent;
  existPresentation.slides = slides || existPresentation.slides;
  existPresentation.groupId = groupId || '';

  try {
    await existPresentation.save();
  } catch (error) {
    return res.status(INTERNAL_SERVER_STATUS_CODE).json(APIResponse(STATUS.ERROR, INTERNAL_SERVER_STATUS_MESSAGE, error.message));
  }

  //ALl SUCCESS
  return res.status(SUCCESS_STATUS_CODE).json(APIResponse(STATUS.OK, SUCCESS_STATUS_MESSAGE, existPresentation));
};

export const deletePresentation = async (req, res) => {
  const id = req.param("id");
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
    const owner = await userModel.findById(user._id);
    owner.presentationIds.splice(owner.presentationIds.indexOf(id), 1);
    await owner.save();
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

      const presentationList =
        ids?.length > 0
          ? await presentationModel.find({
              _id: {
                $in: ids,
              },
            })
          : await presentationModel.find();

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

export const addCollaborator = async (req, res) => {
  const { collaboratorEmail, presentationId, userId } = req.body;

  //Get Member
  let owner;

  try {
    owner = await userModel.findById(userId);
  } catch (error) {
    return res.status(INTERNAL_SERVER_STATUS_CODE).json(APIResponse(STATUS.ERROR, error.message));
  }

  //Get Member
  let collaborator;

  try {
    collaborator = await userModel.findOne({ email: collaboratorEmail });
  } catch (error) {
    return res.status(INTERNAL_SERVER_STATUS_CODE).json(APIResponse(STATUS.ERROR, error.message));
  }

  if (owner?.email === collaborator?.email) {
    return res.status(BAD_REQUEST_STATUS_CODE).json(APIResponse(STATUS.ERROR, "You are the owner of this presentation!"));
  }

  if (!owner || !collaborator) {
    return res.status(NOTFOUND_STATUS_CODE).json(APIResponse(STATUS.ERROR, "Collaborator is not existed!"));
  }

  //Get GroupInstance
  let presentationInstance;

  try {
    presentationInstance = await presentationModel.findById(presentationId);
  } catch (error) {
    return res.status(INTERNAL_SERVER_STATUS_CODE).json(APIResponse(STATUS.ERROR, error.message));
  }

  if (!presentationInstance.ownerId.equals(userId)) {
    return res.status(FORBIDDEN_STATUS_CODE).json(APIResponse(STATUS.ERROR, "You are not allowed to do this", []));
  }

  if (presentationInstance.collaborators?.includes(collaborator._id)) {
    return res.status(BAD_REQUEST_STATUS_CODE).json(APIResponse(STATUS.ERROR, "This user is presentation's collaborator now"));
  }

  try {
    presentationInstance.collaborators.push(collaborator);
    await presentationInstance.save();
  } catch (error) {
    return res.status(INTERNAL_SERVER_STATUS_CODE).json(APIResponse(STATUS.ERROR, error.message));
  }

  return res.status(SUCCESS_STATUS_CODE).json(APIResponse(STATUS.OK, "Add member successfully", collaborator));
};

export const removeCollaborator = async (req, res) => {
  const { collaboratorId, presentationId, userId } = req.body;
  //Get Member
  let owner;

  try {
    owner = await userModel.findById(userId);
  } catch (error) {
    return res.status(INTERNAL_SERVER_STATUS_CODE).json(APIResponse(STATUS.ERROR, error.message));
  }

  if (!owner || !collaboratorId) {
    return res.status(NOTFOUND_STATUS_CODE).json(APIResponse(STATUS.ERROR, "Collaborator is not found"));
  }

  //Get GroupInstance
  let presentationInstance;

  try {
    presentationInstance = await presentationModel.findById(presentationId);
  } catch (error) {
    return res.status(INTERNAL_SERVER_STATUS_CODE).json(APIResponse(STATUS.ERROR, error.message));
  }

  if (!presentationInstance.ownerId.equals(userId)) {
    return res.status(FORBIDDEN_STATUS_CODE).json(APIResponse(STATUS.ERROR, "You are not allowed to do this", []));
  }

  try {
    let index = presentationInstance.collaborators.indexOf(collaboratorId);
    if (index > -1) {
      presentationInstance.collaborators.splice(index, 1);
    }

    await presentationInstance.save();
  } catch (error) {
    return res.status(INTERNAL_SERVER_STATUS_CODE).json(APIResponse(STATUS.ERROR, error.message));
  }

  return res.status(SUCCESS_STATUS_CODE).json(APIResponse(STATUS.OK, "Remove collaborator successfully"));
};

export const getQuestions = async (req, res) => {
  try {
    const id = req.param("id");
    const questionList = await questionModel.find({
      presentationId: id,
    });
    res.status(SUCCESS_STATUS_CODE).json(APIResponse(STATUS.OK, "Get question list successfully", questionList));
  } catch (error) {
    return res.status(INTERNAL_SERVER_STATUS_CODE).json(APIResponse(STATUS.ERROR, error.message));
  }

};


export const saveChat = async (req, res) => {
  const { newChats, presentationId } = req.body

  //Get GroupInstance
  let presentationInstance;

  try {
    presentationInstance = await presentationModel.findById(presentationId);
  } catch (error) {
    return res.status(INTERNAL_SERVER_STATUS_CODE).json(APIResponse(STATUS.ERROR, error.message));
  }

  if (!presentationInstance) {
    return res
      .status(NOTFOUND_STATUS_CODE)
      .json(APIResponse(STATUS.ERROR, "Presentation is not found"));
  }

  presentationInstance.chat = [...presentationInstance.chat, ...newChats]

  try {
    await presentationInstance.save()
  } catch (error) {
    return res.status(INTERNAL_SERVER_STATUS_CODE).json(APIResponse(STATUS.ERROR, error.message));
  }

  return res.status(SUCCESS_STATUS_CODE).json(APIResponse(STATUS.OK, "Save chat successfully"));
}

export const clearChat = async (req, res) => {
  const presentationId = req.param('presentationId')

  console.log(presentationId)

  //Get GroupInstance
  let presentationInstance;

  try {
    presentationInstance = await presentationModel.findById(presentationId);
  } catch (error) {
    return res.status(INTERNAL_SERVER_STATUS_CODE).json(APIResponse(STATUS.ERROR, error.message));
  }

  if (!presentationInstance) {
    return res
      .status(NOTFOUND_STATUS_CODE)
      .json(APIResponse(STATUS.ERROR, "Presentation is not found"));
  }

  presentationInstance.chat = []

  try {
    await presentationInstance.save()
  } catch (error) {
    return res.status(INTERNAL_SERVER_STATUS_CODE).json(APIResponse(STATUS.ERROR, error.message));
  }

  return res.status(SUCCESS_STATUS_CODE).json(APIResponse(STATUS.OK, "Clear chat successfully"));
}

export const getPreviousChat = async (req, res) => {
  const presentationId = req.params["presentId"];
  const page = req.params["page"];
  const perPage = 10;

  console.log(presentationId, page)

  //Get GroupInstance
  let presentationInstance;

  try {
    presentationInstance = await presentationModel.findById(presentationId);
  } catch (error) {
    return res.status(INTERNAL_SERVER_STATUS_CODE).json(APIResponse(STATUS.ERROR, error.message));
  }

  if (!presentationInstance) {
    return res
      .status(NOTFOUND_STATUS_CODE)
      .json(APIResponse(STATUS.ERROR, "Presentation is not found"));
  }

  const allItems = presentationInstance.chat

  return res.status(SUCCESS_STATUS_CODE).json(APIResponse(STATUS.OK, getPaging(page, perPage, allItems)));

}

const getPaging = (page, perPage, allItems) => {
  let dataInclude;
  let countItem = allItems.length - perPage * page;

  if (countItem >= 0) {
    dataInclude = allItems.slice(countItem, allItems.length);
  } else if (-countItem < perPage) {
    let reminder = allItems.length % perPage
    dataInclude = allItems.slice(0, reminder);
  } else dataInclude = []

  const data = dataInclude.slice(0, perPage);
  return data
}