const express = require("express");

const userController = require("../controllers/userController");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

// POST /user/login
router.post("/login", userController.login);
//POST => /user/singup
router.post("/signup", userController.signup);
//GET => /user/getAllMembers
router.get("/getAllMembers", isAuth, userController.getAllMembers);

module.exports = router;
