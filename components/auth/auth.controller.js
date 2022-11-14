const User = require("../../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { SECRET_TOKEN, STATUS } = require("../../constants/common");

const register = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });

    if (user) return res.status(400).json({ status: STATUS.ERROR, error: "Email is used!" });

    const newPassword = await bcrypt.hash(req.body.password, 10);
    await User.create({
      name: req.body.name,
      email: req.body.email,
      password: newPassword,
    });

    return res.status(200).json({ status: STATUS.OK });
  } catch (err) {
    return res.status(400).json({ status: STATUS.ERROR, error: `Register failed: ${err}` });
  }
};

const login = async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
  });

  if (!user) {
    return { status: STATUS.ERROR, error: "Invalid email or password" };
  }

  const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

  if (isPasswordValid) {
    const token = jwt.sign(
      {
        name: user.name,
        email: user.email,
      },
      SECRET_TOKEN
    );

    return res.status(200).json({ status: STATUS.OK, user: token });
  } else {
    return res.status(400).json({ status: STATUS.ERROR, user: false, error: "Invalid email or password" });
  }
};

module.exports = { login, register };
