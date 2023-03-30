module.exports = {
  SECRET_KEY: "superConfidentialToken",
  MONGODB_URI:
    "mongodb+srv://jiteshs:jiteshs7@cluster0.5h1dazv.mongodb.net/task?retryWrites=true&w=majority",
  EMAIL_REGEX:
    /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/,
  USER_STATUS: {
    ADMIN: 0,
    MEMBER: 1,
  },
  TASK_STATUS: {
    NOT_STARTED: "yet to be started",
    IN_PROGRESS: "In progress",
    COMPLETED: "Completed",
    TERMINATED: "Terminated",
  },
};
