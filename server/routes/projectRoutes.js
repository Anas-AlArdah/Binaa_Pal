const express = require('express');
const router = express.Router();
const {
    authenticateToken,
    requireProjectOwner,
    requireSelfBody,
} = require('../middleware/authMiddleware');

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
router.post('/', authenticateToken, requireSelfBody('user_id'), createProject);

// PUT /api/projects/:id
router.put('/:id', authenticateToken, requireProjectOwner('id'), updateProject);

// DELETE /api/projects/:id
router.delete('/:id', authenticateToken, requireProjectOwner('id'), deleteProject);

module.exports = router;
