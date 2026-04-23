const Role=require("../models/Role");
const {createUser} = require("./usercontrollers");

async function createRole(req, res) {
    try{
        const role = await Role.create({
            type:req.body.type,
        })
        res.json(user)
    }catch(err){
        res.status(500).json ({
            message: "failed to create role" ,
            error:err.message
        });
    }

}
async function updateRole(req, res) {
    try{
        const role = await Role.findByPk(req.params.id)
        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }
       await role.update({
            type:req.body.type,
        })
        res.json(role)
    }catch(err){
        res.status(500).json ({
            message: "failed to update role" ,
            error:err.message
        });
    }
}
async function deleteRole(req, res) {
    try{
        const role=await Role.findByPk(req.parmas.id)
        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }
        await role.destroy()
        res.status(200).json({ message: "Role has been deleted successfully" });

    }catch(err){
        res.status(500).json({
            message: "Failed to delete role. Please try again later.",
            error: err.message
        });
    }
}
async function getRolesById(req, res) {
    try{
        const role=await Role.findByPk(req.parmas.id)
        if (!role) {
            return res.status(404).json({ message: "Role not found" });

        }
        res.status(200).json(role)

    }catch(err){
        res.status(500).json({
            message: "Failed to get role. Please try again later.",
            error: err.message
        })
    }
}
async function getAllRole(req, res) {
    try{
        const roles = await Role.findAll()
        res.json(roles)

    }catch(err){
        res.status(500).json({
            message: "Failed to get all roles" ,
            error: err.message
        })
    }
}
module.exports = {
    createRole,
    updateRole,
    deleteRole,
    getRolesById,
    getAllRole

}
