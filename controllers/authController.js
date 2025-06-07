const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// @desc Register new user
const register = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await User.create({ email, password, role });

  const token = generateToken(user);
  res
    .status(201)
    .json({
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
});

// @desc Login user
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = generateToken(user); // it allows the frontend to authenticate future requests without requiring the user to log in again every time.
  res
    .status(200)
    .json({
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
});

module.exports = { register, login };
