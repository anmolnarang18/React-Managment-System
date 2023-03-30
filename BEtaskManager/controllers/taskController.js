const Task = require("../models/taskModel");

const { USER_STATUS, TASK_STATUS } = require("../shared/Constants");

exports.createTask = async (req, res, next) => {
  const {
    name,
    description,
    createdDate = new Date(),
    endDate,
    assignedTo,
    createdBy,
    perHourCost,
    dependentTask,
  } = req.body;

  if (
    !name ||
    !description ||
    !endDate ||
    !assignedTo ||
    !createdBy ||
    !perHourCost
  ) {
    return res.status(422).json("Please enter all required fields.");
  }

  if (req.user.status === USER_STATUS.MEMBER) {
    res.status(422).json("You are not authorized to create a task.");
  }

  try {
    const newTask = await Task.create({
      name,
      description,
      createdDate,
      endDate,
      assignedTo,
      createdBy,
      status: TASK_STATUS.NOT_STARTED,
      perHourCost,
      totalHours: 0,
      dependentTask,
      completionDate: endDate,
    });

    res.status(201).json({
      message: "Task created!",
      data: newTask,
    });
  } catch (error) {
    console.log("ERROR", error);
    res.status(500).json("Something went wrong!");
  }
};

exports.updateTask = async (req, res, next) => {
  const { taskId, status, totalHours } = req.body;

  if (Number(req.user.status) === USER_STATUS.ADMIN) {
    res.status(502).json("User not authorized!");
  }

  try {
    const requiredTask = await Task.findById(taskId);

    if (
      requiredTask.status === TASK_STATUS.NOT_STARTED &&
      status === TASK_STATUS.IN_PROGRESS
    ) {
      const updatedTask = await Task.updateOne(
        {
          _id: taskId,
          assignedTo: req.user._id,
        },
        {
          $set: {
            status,
          },
        }
      );

      res.status(200).json({
        message: "Task status updated!",
        data: updatedTask,
      });
    } else if (
      requiredTask.status === TASK_STATUS.IN_PROGRESS &&
      status === TASK_STATUS.COMPLETED
    ) {
      if (totalHours > 0) {
        const updatedTask = await Task.updateOne(
          {
            _id: taskId,
            assignedTo: req.user._id,
          },
          {
            $set: {
              status,
              totalHours,
              completionDate: new Date(),
            },
          }
        );

        res.status(200).json({
          message: "Task completed!",
          data: updatedTask,
        });
      } else {
        res.status(422).json("Invalid total hours.");
      }
    } else {
      console.log(
        "ERROR TASK",
        `Can not update ${requiredTask.status} to ${status}`
      );
      res
        .status(422)
        .json(`Can not update ${requiredTask.status} to ${status}`);
    }
  } catch (error) {}
};

exports.getAllTasks = async (req, res, next) => {
  const { status } = req.query;

  try {
    const keyword = status
      ? {
          $and: [
            {
              $or: [
                { createdBy: { $eq: req.user._id } },
                { assignedTo: { $eq: req.user._id } },
              ],
            },
            { status: { $eq: status } },
          ],
        }
      : {};
    const tasks = await Task.find(keyword)
      .populate("assignedTo", "-password")
      .populate("createdBy", "-password")
      .populate("dependentTask", "name _id status");

    res.status(200).json({
      message: "Tasks fetched!",
      data: tasks,
    });
  } catch (error) {
    console.log("ERROR", error);
    res.status(500).json("Something went wrong!");
  }
};
