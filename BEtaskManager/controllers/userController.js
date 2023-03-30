const User = require("../models/userModel");

const { generateToken } = require("../utils/generateToken");
const { EMAIL_REGEX, USER_STATUS } = require("../shared/Constants");

exports.login = async (req, res, next) => {
  const { email, password, status } = req.body;
  if (!email || !password) {
    return res.status(422).json("Please enter all required fields.");
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(422).json("Please enter valid email address.");
  }

  if (password.length < 6) {
    return res.status(422).json("Password must be atleast 6 characters long.");
  }

  try {
    const user = await User.findOne({ email });
    if (user) {
      if (user.status != status) return res.status(404).json("User not found!");
      // const isCorrect = await bcrypt.compare(password, user.password);
      const isCorrect = await user.matchPassword(password);
      if (!isCorrect) {
        return res.status(422).json("Invalid email or password");
      }

      const token = generateToken(user.email, user.password);

      return res.status(200).json({
        message: "User logged in!",
        data: {
          email: user.email,
          name: user.name,
          status: user.status,
          createdBy: user.createdBy,
          token,
          _id: user._id,
        },
      });
    } else {
      return res.status(404).json("User not found!");
    }
  } catch (error) {
    console.log("UserController.js login() Error=", error);
    res.status(504).json("Something went wrong!");
  }
};

exports.signup = async (req, res, next) => {
  const { name, email = "", password, status, createdBy } = req.body;

  if (!name || !email || !password) {
    return res.status(422).json("Please enter all required fields.");
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(422).json("Please enter valid email address.");
  }

  if (password.length < 6) {
    return res.status(422).json("Password must be atleast 6 characters long.");
  }
  try {
    const user = await User.findOne({ email });

    if (user) return res.status(422).json("User already exists!");

    if (Number(status) === USER_STATUS.MEMBER) {
      if (!createdBy) {
        return res.status(404).json("Admin for member creation not found!");
      } else {
        const adminUser = await User.findById(createdBy);

        if (Number(adminUser.status) !== USER_STATUS.ADMIN) {
          return res.status(422).json("Only admins can create a member.");
        }
      }
    }

    User.create({
      name,
      email,
      password,
      status,
      createdBy,
    })
      .then((userData) => {
        const token = generateToken(userData.email, userData.password);

        res.status(201).json({
          message: "User created!",
          data: {
            email: userData.email,
            name: userData.name,
            createdBy: userData.createdBy,
            status: userData.status,
            _id: userData._id,
            token,
          },
        });
      })
      .catch((err) => {
        console.log("auth.js signup Error=", err);
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        res.status(500).json("Something went wrong!");
      });
  } catch (error) {
    console.log("SIGNUP ERROR", error);
    res.status(500).json("Something went wrong!");
  }
};

exports.getAllMembers = async (req, res, next) => {
  try {
    const users = await User.find({
      status: { $eq: USER_STATUS.MEMBER },
    });
    res.status(200).json({
      message: "Members fetched successfully!",
      data: users,
    });
  } catch (error) {
    console.log("userController.js getAllMembers() error=", error);
    res.status(422).json("Something went wrong");
  }
};
