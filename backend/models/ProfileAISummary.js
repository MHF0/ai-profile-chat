const mongoose = require("mongoose");

const profileAISummarySchema = new mongoose.Schema({
  id: String,
  uuid: { type: String, unique: true, required: true },
  job_id: String,
  user_id: String,
  createdAt: Date,
  updatedAt: Date,
  job_flow_id: String,
  moved: { type: Number, default: 0 }, // 0 = not moved, 1 = moved to CRM
  relevant_months: String,
  open_to_work: String,
  fit_percentage: Number,
  matched: Object, // JSON object for matched data (e.g., full_profile summary)
  contacted: String,
  unlocked: String,
  attributes: String,
  old: String,
  email_found: String,
  viewed: String,
});

const ProfileAISummary = mongoose.model(
  "ProfileAISummary",
  profileAISummarySchema
);

module.exports = ProfileAISummary;
