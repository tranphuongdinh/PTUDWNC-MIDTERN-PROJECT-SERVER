import userModel from '../../models/user.model.js';
import groupModel from '../../models/group.model.js';
import { v4 as uuidv4 } from 'uuid';
import {
  BAD_REQUEST_STATUS_CODE,
  BAD_REQUEST_STATUS_MESSAGE,
  FORBIDDEN_STATUS_CODE,
  FORBIDDEN_STATUS_MESSAGE,
  INTERNAL_SERVER_STATUS_CODE,
  INTERNAL_SERVER_STATUS_MESSAGE,
  SUCCESS_STATUS_CODE,
  SUCCESS_STATUS_MESSAGE,
} from '../../constants/http-response.js';
import { APIResponse } from '../../models/APIResponse.js';
import { STATUS } from '../../constants/common.js';
import jwt from 'jsonwebtoken';

export const createGroup = async (req, res) => {
  const { name, token } = req.body;

  //Check name exists
  try {
    const existGroup = await groupModel.findOne({ name });
    if (existGroup) {
      return res
        .status(BAD_REQUEST_STATUS_CODE)
        .json(
          APIResponse(
            STATUS.ERROR,
            BAD_REQUEST_STATUS_MESSAGE,
            'Your group name is already existed'
          )
        );
    }
  } catch (error) {
    return res
      .status(INTERNAL_SERVER_STATUS_CODE)
      .json(
        APIResponse(STATUS.ERROR, INTERNAL_SERVER_STATUS_MESSAGE, error.message)
      );
  }

  //Get Owner
  const owner = jwt.decode(token);
  let ownerUser;

  try {
    ownerUser = await userModel.findOne({ name: owner.name });
  } catch (error) {
    return res
      .status(INTERNAL_SERVER_STATUS_CODE)
      .json(
        APIResponse(STATUS.ERROR, INTERNAL_SERVER_STATUS_MESSAGE, error.message)
      );
  }

  const newGroup = new groupModel({
    name,
    ownerId: ownerUser._id,
    memberIds: [],
    coOwnerIds: [],
    inviteCode: []
  });

  //Add group to user
  ownerUser.myGroupIds.push(newGroup);
  try {
    await ownerUser.save();
    await newGroup.save();
  } catch (error) {
    return res
      .status(INTERNAL_SERVER_STATUS_CODE)
      .json(
        APIResponse(STATUS.ERROR, INTERNAL_SERVER_STATUS_MESSAGE, error.message)
      );
  }

  //ALl SUCCESS
  return res
    .status(SUCCESS_STATUS_CODE)
    .json(APIResponse(STATUS.OK, SUCCESS_STATUS_MESSAGE, newGroup));
};

export const createInviteLink = async (req, res) => {
  const { groupId, token } = req.body;

  let groupInstance;

  try {
    groupInstance = await groupModel.findById(groupId);
  } catch (error) {
    return res
      .status(INTERNAL_SERVER_STATUS_CODE)
      .json(
        APIResponse(STATUS.ERROR, INTERNAL_SERVER_STATUS_MESSAGE, error.message)
      );
  }

  // Get owner information
  const owner = jwt.decode(token);
  let ownerUser;

  try {
    ownerUser = await userModel.findOne({ name: owner.name });
  } catch (error) {
    return res
      .status(INTERNAL_SERVER_STATUS_CODE)
      .json(
        APIResponse(STATUS.ERROR, INTERNAL_SERVER_STATUS_MESSAGE, error.message)
      );
  }

  // Check if requester is group's owner
  if (!groupInstance.ownerId.equals(ownerUser._id)) {
      return res
        .status(FORBIDDEN_STATUS_CODE)
        .json(
          APIResponse(
            STATUS.ERROR,
            FORBIDDEN_STATUS_MESSAGE,
            'You are not allowed to do this'
          )
        );
  }

  const code = uuidv4();
  groupInstance.inviteCode.push(code)

  try {
    await groupInstance.save()
  } catch (error) {
    return res
      .status(INTERNAL_SERVER_STATUS_CODE)
      .json(
        APIResponse(STATUS.ERROR, INTERNAL_SERVER_STATUS_MESSAGE, error.message)
      );
  }

  //ALl SUCCESS
  return res.status(SUCCESS_STATUS_CODE).json(APIResponse(STATUS.OK, SUCCESS_STATUS_MESSAGE,{groupId: groupInstance._id, code}))
};

export const inviteByLink = async (req, res) => {
  const { code, groupId, userId } = req.body;

  //Get Member
  let memberUser;

  try {
    memberUser = await userModel.findById(userId);
  } catch (error) {
    return res
      .status(INTERNAL_SERVER_STATUS_CODE)
      .json(
        APIResponse(STATUS.ERROR, INTERNAL_SERVER_STATUS_MESSAGE, error.message)
      );
  }

  //Get GroupInstance
  let groupInstance;

  try {
    groupInstance = await groupModel.findById(groupId);
  } catch (error) {
    return res
      .status(INTERNAL_SERVER_STATUS_CODE)
      .json(
        APIResponse(STATUS.ERROR, INTERNAL_SERVER_STATUS_MESSAGE, error.message)
      );
  }

  //Check code
  if (!groupInstance.inviteCode.includes(code)) {
    return res
      .status(FORBIDDEN_STATUS_CODE)
      .json(
        APIResponse(STATUS.ERROR, FORBIDDEN_STATUS_MESSAGE, 'You are not invited')
      );
  }

  //Remove inviteCode and add to member
  var index = groupInstance.inviteCode.indexOf(code);
  if (index > -1) {
    groupInstance.inviteCode.splice(index, 1);
  }
  
  groupInstance.memberIds.push(memberUser);
  memberUser.joinedGroupIds.push(groupInstance);

  try {
    await groupInstance.save()
    await memberUser.save()
  } catch (error) {
    return res
      .status(INTERNAL_SERVER_STATUS_CODE)
      .json(
        APIResponse(STATUS.ERROR, INTERNAL_SERVER_STATUS_MESSAGE, error.message)
      );
  }

  return res.status(SUCCESS_STATUS_CODE).json(APIResponse(STATUS.OK, SUCCESS_STATUS_MESSAGE, 'Add successfully'))
}

export const upgradeRole = async (req, res) => {
  const { memberId, roleCode, groupId, token, isUpgrade } = req.body;

  // Get owner information
  const owner = jwt.decode(token);
  let ownerUser;

  try {
    ownerUser = await userModel.findOne({ name: owner.name });
  } catch (error) {
    return res
      .status(INTERNAL_SERVER_STATUS_CODE)
      .json(
        APIResponse(STATUS.ERROR, INTERNAL_SERVER_STATUS_MESSAGE, error.message)
      );
  }

  // Get member information
  let memberUser;

  try {
    memberUser = await userModel.findById(memberId);
  } catch (error) {
    return res
      .status(INTERNAL_SERVER_STATUS_CODE)
      .json(
        APIResponse(STATUS.ERROR, INTERNAL_SERVER_STATUS_MESSAGE, error.message)
      );
  }

  //Get GroupInstance
  let groupInstance;

  try {
    groupInstance = await groupModel.findById(groupId);
  } catch (error) {
    return res
      .status(INTERNAL_SERVER_STATUS_CODE)
      .json(
        APIResponse(STATUS.ERROR, INTERNAL_SERVER_STATUS_MESSAGE, error.message)
      );
  }

  //Check if requester is group's owner
  if (!groupInstance.ownerId.equals(ownerUser._id)) {
    return res
      .status(FORBIDDEN_STATUS_CODE)
      .json(
        APIResponse(
          STATUS.ERROR,
          FORBIDDEN_STATUS_MESSAGE,
          'You are not allowed to do this'
        )
      );
  }

  if (isUpgrade) {
    //Move from member to co-owner
    var index = groupInstance.memberIds.indexOf(memberUser._id);
    if (index > -1) {
      groupInstance.memberIds.splice(index, 1);
    }

    groupInstance.coOwnerIds.push(memberUser);

    try {
      await groupInstance.save()
    } catch (error) {
      return res
        .status(INTERNAL_SERVER_STATUS_CODE)
        .json(
          APIResponse(
            STATUS.ERROR,
            INTERNAL_SERVER_STATUS_MESSAGE,
            error.message
          )
        );
    }

    return res.status(SUCCESS_STATUS_CODE).json(APIResponse(STATUS.OK, SUCCESS_STATUS_MESSAGE, 'Upgrade role successfully'))
  }
  else {
    //Move from co-owner to member
     var index = groupInstance.coOwnerIds.indexOf(memberUser._id);
    if (index > -1) {
      groupInstance.coOwnerIds.splice(index, 1);
    }

    groupInstance.memberIds.push(memberUser);

    try {
      await groupInstance.save()
    } catch (error) {
      return res
        .status(INTERNAL_SERVER_STATUS_CODE)
        .json(
          APIResponse(
            STATUS.ERROR,
            INTERNAL_SERVER_STATUS_MESSAGE,
            error.message
          )
        );
    }

    return res.status(SUCCESS_STATUS_CODE).json(APIResponse(STATUS.OK, SUCCESS_STATUS_MESSAGE, 'Downgrade role successfully'))
  }
};
