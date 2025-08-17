const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  uuid: { type: String, unique: true, required: true },
  first_name: String,
  last_name: String,
  full_name: String,
  location_name: String,
  location_code: String,
  location_raw: String,
  gender: String,
  job_title: String,
  summary: String,
  linkedin_url: String,
  linkedin_public_id: String,
  picture_url: String,
  years_of_experience: Number,
  months_of_experience: Number,
  skills: [String],
  experiences: [
    {
      title: String,
      description: String,
      employment_type: String,
      company_name: String,
      company_linkedin_url: String,
      location: String,
      start_date: Date,
      end_date: Date,
      current: Boolean,
    },
  ],
  education: [
    {
      school_name: String,
      degree_name: String,
      field_of_study: String,
      start_year: Number,
      end_year: Number,
    },
  ],
  languages: [String],
  work_emails: [String],
  nationality: String,
  personal_emails: [String],
  phones: [String],
  social_links: [String],
  created_at: Date,
  updated_at: Date,
  current_industry: String,
  seniority_level: String,
  functional_area: String,
  awards: [String],
  publications: [
    {
      date: String,
      issue: String,
      description: String,
      title: String,
      url: String,
    },
  ],
  certifications: [
    {
      date: String,
      reference: String,
      start_date: Date,
      end_date: Date,
      description: String,
      title: String,
    },
  ],
  patents: [String],
  memberships: [String],
  current_company: {
    name: String,
    description: String,
    industry: String,
    size: String,
    location: {
      code: String,
      raw: String,
    },
  },
  grad_year: Number,
  current_title: String,
  content_hash: String,
});

const Profile = mongoose.model("Profile", profileSchema);

module.exports = Profile;
