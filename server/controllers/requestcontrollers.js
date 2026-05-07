const {Request,User,Offer} = require('../models');

async function createRequest(req, res) {
    try {
        if (!req.body.description || !req.body.user_id) {
            return res.status(400).json({
                message: "description and user_id are required"
            });
        }

        const request = await Request.create({
            description: req.body.description,
            city: req.body.city,
            date: req.body.date,
            status: req.body.status || "pending",
            user_id: req.body.user_id,
            offers_id: req.body.offers_id,
        });

        res.status(201).json(request);

    } catch (err) {
        res.status(500).json({
            message: "Error creating request",
            error: err.message
        });
    }
}

async function getRequestById(req, res) {
    try {
        const request = await Request.findByPk(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'No records found' });
        }

        res.status(200).json(request);

    } catch (err) {
        res.status(400).json({
            message: 'Error getting request',
            error: err.message
        });
    }
}

async function getAllRequests(req, res) {
    try {
        const requests = await Request.findAll({
            include: [{model : User,
            as:"user"
            },
              {
                model: Offer,
                as: "offer"
            }
            ]
        });
        res.status(200).json(requests);

    } catch (err) {
        res.status(400).json({
            message: 'Error getting requests',
            error: err.message
        });
    }
}

async function deleteRequest(req, res) {
    try {
        const request = await Request.findByPk(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'No records found' });
        }

        await request.destroy();

        res.status(200).json({ message: 'Request deleted successfully' });

    } catch (err) {
        res.status(500).json({
            message: 'Error deleting request',
            error: err.message
        });
    }
}
async function updateRequest(req, res) {
    try{
        const request=await Request.findByPk(req.params.id)
        if(!request){
            return res.status(404).json({ message: 'No records found' });
        }
        await request.update({
            description: req.body.description,
            city: req.body.city,
            date: req.body.date,
            status: req.body.status,
            user_id: req.body.user_id,
            offers_id: req.body.offers_id,

        })
        res.status(200).json(request);
    }catch(err){
        res.status(500).json({
            message: 'Error updating request',
            error: err.message

        })
    }
}

module.exports = {
    createRequest,
    getRequestById,
    getAllRequests,
    deleteRequest,
    updateRequest,
};