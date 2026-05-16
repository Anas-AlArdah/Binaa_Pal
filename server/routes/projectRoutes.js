const express = require('express');
const router = express.Router();

const {
    getAllProjects,
    getProjectById,
    getProjectsByUser,
    createProject,
    updateProject,
    deleteProject,
} = require('../controllers/projectControllers');

// GET /api/projects
router.get('/', getAllProjects);

// GET /api/projects/user/:userId
router.get('/user/:userId', getProjectsByUser);

// GET /api/projects/:id
router.get('/:id', getProjectById);

// POST /api/projects
router.post('/', createProject);

// PUT /api/projects/:id
router.put('/:id', updateProject);

// DELETE /api/projects/:id
router.delete('/:id', deleteProject);

module.exports = router;
