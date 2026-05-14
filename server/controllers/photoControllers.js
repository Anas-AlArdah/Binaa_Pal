const { Photo, Project } = require('../models');

// ─── GET all photos ───────────────────────────────────────────────────────────
const getAllPhotos = async (req, res) => {
    try {
        const photos = await Photo.findAll({
            include: [
                {
                    model: Project,
                    as: 'project',
                    attributes: ['pro_id', 'title_p', 'description_p'],
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        return res.status(200).json(photos);

    } catch (error) {
        console.error('getAllPhotos error:', error);

        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

// ─── GET photo by ID ──────────────────────────────────────────────────────────
const getPhotoById = async (req, res) => {
    try {
        const { id } = req.params;

        const photo = await Photo.findByPk(id, {
            include: [
                {
                    model: Project,
                    as: 'project',
                    attributes: ['pro_id', 'title_p', 'description_p'],
                },
            ],
        });

        if (!photo) {
            return res.status(404).json({
                message: 'Photo not found'
            });
        }

        return res.status(200).json(photo);

    } catch (error) {
        console.error('getPhotoById error:', error);

        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

// ─── GET photos by project ────────────────────────────────────────────────────
const getPhotosByProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        const photos = await Photo.findAll({
            where: { pro_id: projectId },
            order: [['createdAt', 'DESC']],
        });

        return res.status(200).json(photos);

    } catch (error) {
        console.error('getPhotosByProject error:', error);

        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

// ─── POST create photo ────────────────────────────────────────────────────────
const createPhoto = async (req, res) => {
    try {
        const { image_url, pro_id } = req.body;

        if (!image_url || !pro_id) {
            return res.status(400).json({
                message: 'image_url and pro_id are required'
            });
        }

        // Verify project exists
        const project = await Project.findByPk(pro_id);

        if (!project) {
            return res.status(404).json({
                message: 'Project not found'
            });
        }

        const photo = await Photo.create({
            image_url,
            pro_id
        });

        return res.status(201).json({
            message: 'Photo created successfully',
            photo
        });

    } catch (error) {
        console.error('createPhoto error:', error);

        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

// ─── PUT update photo ─────────────────────────────────────────────────────────
const updatePhoto = async (req, res) => {
    try {
        const { id } = req.params;
        const { image_url, pro_id } = req.body;

        const photo = await Photo.findByPk(id);

        if (!photo) {
            return res.status(404).json({
                message: 'Photo not found'
            });
        }

        await photo.update({
            image_url,
            pro_id
        });

        return res.status(200).json({
            message: 'Photo updated successfully',
            photo
        });

    } catch (error) {
        console.error('updatePhoto error:', error);

        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

// ─── DELETE photo ─────────────────────────────────────────────────────────────
const deletePhoto = async (req, res) => {
    try {
        const { id } = req.params;

        const photo = await Photo.findByPk(id);

        if (!photo) {
            return res.status(404).json({
                message: 'Photo not found'
            });
        }

        await photo.destroy();

        return res.status(200).json({
            message: 'Photo deleted successfully'
        });

    } catch (error) {
        console.error('deletePhoto error:', error);

        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = {
    getAllPhotos,
    getPhotoById,
    getPhotosByProject,
    createPhoto,
    updatePhoto,
    deletePhoto,
};