const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    technologies: {
      type: [String],
      default: [],
    },
    githubUrl: {
      type: String,
      trim: true,
    },
    deployedUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ["Planning", "In Progress", "Completed"],
        message: "Status must be one of: Planning, In Progress, Completed",
      },
      default: "Planning",
    },
    // Reference to the user who owns this project.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    // Adds createdAt and updatedAt automatically.
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);
