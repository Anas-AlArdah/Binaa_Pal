
const {User,Role}=require("../models");

async function createUser(req, res) {
    try{
        const user = await User.create({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: req.body.password,
            phone: req.body.phone,
            location: req.body.location,
            role_id: req.body.role_id,

        })
        res.status(201).json(user);



    }catch(err){
        res.status(500).json({
            message: "Failed to create user. Please try again later.",
            error: err.message
        });

    }
}

async function getUserByID(req, res) {
    try {
        {
        }
        const user = await User.findByPk(req.params.id,{
            include: {
                model: Role,
                attributes:['type'],
                as: "role"
            }
        })
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user)
    }catch(err){
        res.status(500).json({
            message: "Failed to create user. Please try again later.",
            error: err.message  // بيعطيك سبب الخطأ بالضبط
        });

    }

}
async function deleteUser(req,res){
    try{
        const user=await User.findByPk(req.params.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
       await user.destroy()
        res.status(200).json({ message: "Successfully deleted" });
    } catch (err) {
        res.status(500).json({
            message: "Failed to delete user. Please try again later.",
            error: err.message
        });

}
}
async function updateUser(req,res){
    try {
        const user= await User.findByPk(req.params.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        await user.update({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: req.body.password,
            phone: req.body.phone,
            location: req.body.location,
            role_id: req.body.role_id,
        });
        res.status(200).json(user);

    } catch (err) {
        res.status(500).json({
            message: "Failed to update user. Please try again later.",
            error: err.message
        });
}}
async function getAllUsers(req,res){
    try{
        const user=await User.findAll()
        res.status(200).json(user);
    }catch(err){
        res.status(500).json({
            message: "Failed to get users. Please try again later.",
            error: err.message
        });
    }

}
module.exports = {
    createUser,
    getAllUsers,
    updateUser,
    deleteUser,
    getUserByID,
}


