const express = require('express');
const router=express.Router();
const {creatuser,getallusers,updateuser,deleteuser}=require('../controller/usercontroller');


router.post('/',creatuser);
router.get('/',getallusers);
router.put('/:id',updateuser);
router.delete('/:id',deleteuser);

module.exports=router;