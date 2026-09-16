const user=require('../models/User');

exports.creatuser=async(req,res)=>{
    try{
        const newuser=await user.create(req.body);
        res.status(200).json(newuser);
    }
    catch(err){
        res.status(400).json({message:err.message});
    }
};
// all users
exports.getallusers=async(req,res)=>{
    try{
        const users=await user.find();
        res.status(200).json(users);
    }
    catch(err){
        res.status(400).json({message:err.message});
    }   
};
// update user
exports.updateuser=async(req,res)=>{
    try{
        const updateduser=await user.findByIdAndUpdate(req.params.id,req.body,{new:true});
        res.status(200).json(updateduser);
    }
    catch(err){
        res.status(400).json({message:err.message});
    }
};
// delete user
exports.deleteuser=async(req,res)=>{
    try{
        const deleteduser=await user.findByIdAndDelete(req.params.id);
        res.status(200).json(deleteduser);
    }
    catch(err){
        res.status(400).json({message:err.message});
    }
};