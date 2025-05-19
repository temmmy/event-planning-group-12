const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create models from schemas
const User = require("../models/user");
const SystemSettings = require("../models/settings");
const Event_ = require("../models/event");
const Invitation = require("../models/invitation");
const Discussion = require("../models/discussion");
const Notification_ = require("../models/notification");
const Statistics = require("../models/statistics");

module.exports = {
  User,
  SystemSettings,
  Event_,
  Invitation,
  Discussion,
  Notification,
  Statistics,
};
