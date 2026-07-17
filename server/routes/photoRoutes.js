const express = require('express');
const router = express.Router();
const {
    authenticateToken,
    requirePhotoOwner,
    requireProjectBodyOwner,
} = require('../middleware/authMiddleware');

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
router.post('/', authenticateToken, requireProjectBodyOwner('pro_id'), createPhoto);

// PUT /api/photos/:id
router.put(
    '/:id',
    authenticateToken,
    requirePhotoOwner('id'),
    requireProjectBodyOwner('pro_id'),
    updatePhoto
);

// DELETE /api/photos/:id
router.delete('/:id', authenticateToken, requirePhotoOwner('id'), deletePhoto);

module.exports = router;
