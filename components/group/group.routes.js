import express from 'express';
import authenticationMiddleware from '../../middleware/auth.middleware.js';
import {
  createGroup,
  createInviteLink,
  inviteByLink,
  upgradeRole,
} from './group.controller.js';

const router = express.Router();

router.post('/create', authenticationMiddleware, createGroup);
router.post('/link', authenticationMiddleware, createInviteLink);
router.post('/invite', inviteByLink);
router.post('/role', authenticationMiddleware, upgradeRole);

export default router;
