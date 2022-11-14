import express from 'express';
import { AUTH_ROUTE } from '../../constants/routes.js';
import authenticationMiddleware from '../../middleware/auth.middleware.js';
import { login, register } from './auth.controller.js';

const router = express.Router();

router.post(AUTH_ROUTE.LOGIN, login);
router.post(AUTH_ROUTE.REGISTER, register);
router.get('/test', authenticationMiddleware, (req, res) => {
  res.json({ name: 'thoi' });
});

export default router;
