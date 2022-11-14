const router = require("express").Router();
const { AUTH_ROUTE } = require("../../constants/routes");
const { login, register } = require("./auth.controller");

router.post(AUTH_ROUTE.LOGIN, login);
router.post(AUTH_ROUTE.REGISTER, register);

module.exports = router;
