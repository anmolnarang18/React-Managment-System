const express = require("express");

const isAuth = require("../middleware/isAuth");
const taskController = require("../controllers/taskController");

const router = express.Router();

// Post task/createTask
router.post("/createTask", isAuth, taskController.createTask);

// PUT task/updateTask
router.put("/updateTask", isAuth, taskController.updateTask);

// GET task/getAllTasks
router.get("/getAllTasks", isAuth, taskController.getAllTasks);

module.exports = router;
