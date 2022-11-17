import express from 'express';
import { AUTH_ROUTE } from '../../constants/routes.js';
import { login, register } from './auth.controller.js';
import { sendEmail } from '../../config/email/emailService.js';

const router = express.Router();

router.post(AUTH_ROUTE.LOGIN, login);
router.post(AUTH_ROUTE.REGISTER, register);
router.get('/test', (req, res) => {
  sendEmail('boombeachbill@gmail.com','xasivo3854@klblogs.com','OK', 'Yes sir')
  res.send({status: 'Success'});
});

export default router;
