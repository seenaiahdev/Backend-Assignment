const Project = require("../models/Project");
const asyncHandler = require("../utils/asyncHandler");

/**
 * @desc    Create a new project for the logged-in user
 * @route   POST /api/projects
 * @access  Private
 */
const createProject = asyncHandler(async (req, res) => {
  const { title, description, technologies, githubUrl, deployedUrl, status } =
    req.body;

  if (!title || !description) {
    return res
      .status(400)
      .json({ message: "Title and description are required" });
  }

  const project = await Project.create({
    title,
    description,
    technologies,
    githubUrl,
    deployedUrl,
    status,
    user: req.user._id, // owner comes from the authenticated user
  });

  res.status(201).json({
    message: "Project created successfully",
    project,
  });
});

/**
 * @desc    Get all projects belonging to the logged-in user
 * @route   GET /api/projects
 * @access  Private
 */
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ user: req.user._id }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    count: projects.length,
    projects,
  });
});

/**
 * @desc    Get a single project by id (must belong to the logged-in user)
 * @route   GET /api/projects/:id
 * @access  Private
 */
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  // Ownership check: users may only view their own projects.
  if (project.user.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "Not authorized to access this project" });
  }

  res.status(200).json({ project });
});

/**
 * @desc    Update a project (must belong to the logged-in user)
 * @route   PUT /api/projects/:id
 * @access  Private
 */
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (project.user.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "Not authorized to update this project" });
  }

  // Only update the fields that were actually provided in the request.
  const fields = [
    "title",
    "description",
    "technologies",
    "githubUrl",
    "deployedUrl",
    "status",
  ];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      project[field] = req.body[field];
    }
  });

  const updatedProject = await project.save();

  res.status(200).json({
    message: "Project updated successfully",
    project: updatedProject,
  });
});

/**
 * @desc    Delete a project (must belong to the logged-in user)
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  // A user must not be able to delete another user's project.
  if (project.user.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "Not authorized to delete this project" });
  }

  await project.deleteOne();

  res.status(200).json({ message: "Project deleted successfully" });
});

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
