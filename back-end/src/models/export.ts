// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

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
