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

// GET /api/photos
router.get('/', getAllPhotos);

// مهم: هذا لازم قبل /:id
// GET /api/photos/project/:projectId
router.get('/project/:projectId', getPhotosByProject);

// GET /api/photos/:id
router.get('/:id', getPhotoById);

// POST /api/photos
router.post('/', createPhoto);

// PUT /api/photos/:id
router.put('/:id', updatePhoto);

// DELETE /api/photos/:id
router.delete('/:id', deletePhoto);

module.exports = router;