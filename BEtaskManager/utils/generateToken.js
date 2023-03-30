const jwt = require("jsonwebtoken");

const { SECRET_KEY } = require("../shared/constants");

exports.generateToken = (email, password) => {
  return jwt.sign(
    {
      email,
      password,
    },
    SECRET_KEY,
    {
      expiresIn: "30d",
    }
  );
};
