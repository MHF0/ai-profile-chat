const mongoose = require("mongoose");

const jobInfoSchema = new mongoose.Schema({
  id: String,
  job_flow_id: String,
  job_id: String,
  attributes: Object, // JSON object for majors, skills, titles, languages, etc.
  createdAt: Date,
  updatedAt: Date,
});

const JobInfo = mongoose.model("JobInfo", jobInfoSchema);

module.exports = JobInfo;
