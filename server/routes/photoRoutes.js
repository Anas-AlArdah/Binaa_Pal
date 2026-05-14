const express = require('express');
const router = express.Router();
const {
    getAllPhotos,
    getPhotoById,
    getPhotosByProject,
    createPhoto,
    updatePhoto,
    deletePhoto,
} = require('../controllers/photoControllers');

// GET /api/photos                          → all photos (with project info)
router.get('/', getAllPhotos);

// GET /api/photos/:id                      → single photo by ph_id
router.get('/:id', getPhotoById);

// GET /api/photos/project/:projectId       → photos for a specific project
router.get('/project/:projectId', getPhotosByProject);

// POST /api/photos                         → add new photo
router.post('/', createPhoto);

// PUT /api/photos/:id                      → update photo
router.put('/:id', updatePhoto);

// DELETE /api/photos/:id                   → delete photo
router.delete('/:id', deletePhoto);

module.exports = router;