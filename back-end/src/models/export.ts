const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create models from schemas
const User = require("../models/user");
const SystemSettings = require("../models/settings");
const Event_ = require("../models/event");
const Invitation = mongoose.model("Invitation", InvitationSchema);
const Discussion = mongoose.model("Discussion", DiscussionSchema);
const Notification_ = mongoose.model("Notification", NotificationSchema);
const Statistics = mongoose.model("Statistics", StatisticsSchema);

module.exports = {
  User,
  SystemSettings,
  Event_,
  Invitation,
  Discussion,
  Notification,
  Statistics,
};
