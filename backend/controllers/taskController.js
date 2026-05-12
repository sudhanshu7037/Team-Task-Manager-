const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res) => {
  const { title, description, dueDate, project, assignedTo, status, priority } = req.body;

  try {
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      project,
      assignedTo: assignedTo || null,
      status: status || 'Pending',
      priority: priority || 'Medium'
    });
    
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tasks (filter by project)
// @route   GET /api/tasks?project=:id
// @access  Private
const getTasks = async (req, res) => {
  try {
    const query = {};
    if (req.query.project) {
      query.project = req.query.project;
    } else if (req.user.role !== 'Admin') {
      // Member sees their assigned tasks
      query.assignedTo = req.user._id;
    }

    const tasks = await Task.find(query).populate('project', 'name').populate('assignedTo', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check authorization: Admin or assigned user
    if (req.user.role !== 'Admin' && (!task.assignedTo || !task.assignedTo.equals(req.user._id))) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    task.status = status;
    const updatedTask = await task.save();
    
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTask, getTasks, updateTaskStatus };
