const { Project, Photo, User } = require('../models');

// ─── GET all projects (with their photos) ─────────────────────────────────────
const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.findAll({
            include: [
                { model: Photo, as: 'photos' },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstname', 'lastname', 'email'],
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        return res.status(200).json(projects);

    } catch (error) {
        console.error('getAllProjects error:', error);

        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

// ─── GET project by ID ────────────────────────────────────────────────────────
const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await Project.findByPk(id, {
            include: [
                { model: Photo, as: 'photos' },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstname', 'lastname', 'email'],
                },
            ],
        });

        if (!project) {
            return res.status(404).json({
                message: 'Project not found'
            });
        }

        return res.status(200).json(project);

    } catch (error) {
        console.error('getProjectById error:', error);

        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

// ─── GET projects by user_id ──────────────────────────────────────────────────
const getProjectsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const projects = await Project.findAll({
            where: { user_id: userId },
            include: [
                { model: Photo, as: 'photos' }
            ],
            order: [['createdAt', 'DESC']],
        });

        return res.status(200).json(projects);

    } catch (error) {
        console.error('getProjectsByUser error:', error);

        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

// ─── POST create project ──────────────────────────────────────────────────────
const createProject = async (req, res) => {
    try {
        const { user_id, title_p, description_p } = req.body;

        if (!user_id || !title_p) {
            return res.status(400).json({
                message: 'user_id and title_p are required'
            });
        }

        const project = await Project.create({
            user_id,
            title_p,
            description_p
        });

        return res.status(201).json({
            message: 'Project created successfully',
            project
        });

    } catch (error) {
        console.error('createProject error:', error);

        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

// ─── PUT update project ───────────────────────────────────────────────────────
const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { title_p, description_p } = req.body;

        const project = await Project.findByPk(id);

        if (!project) {
            return res.status(404).json({
                message: 'Project not found'
            });
        }

        await project.update({
            title_p,
            description_p
        });

        return res.status(200).json({
            message: 'Project updated successfully',
            project
        });

    } catch (error) {
        console.error('updateProject error:', error);

        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

// ─── DELETE project ───────────────────────────────────────────────────────────
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await Project.findByPk(id);

        if (!project) {
            return res.status(404).json({
                message: 'Project not found'
            });
        }

        await project.destroy();

        return res.status(200).json({
            message: 'Project deleted successfully'
        });

    } catch (error) {
        console.error('deleteProject error:', error);

        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = {
    getAllProjects,
    getProjectById,
    getProjectsByUser,
    createProject,
    updateProject,
    deleteProject,
};