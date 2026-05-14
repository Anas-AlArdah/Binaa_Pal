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

// GET /api/projects              → all projects (with photos)
router.get('/', getAllProjects);

// GET /api/projects/:id          → single project by pro_id
router.get('/:id', getProjectById);

// GET /api/projects/user/:userId → projects filtered by user
router.get('/user/:userId', getProjectsByUser);

// POST /api/projects             → create new project
router.post('/', createProject);

// PUT /api/projects/:id          → update project
router.put('/:id', updateProject);

// DELETE /api/projects/:id       → delete project (cascades photos)
router.delete('/:id', deleteProject);

module.exports = router;