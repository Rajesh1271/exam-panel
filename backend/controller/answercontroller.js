const answer=require("../models/answer");

// Create a new answer
exports.createanswer=async(req,res)=>{
    try{
        const newanswer=await answer.create(req.body);
        res.status(200).json(newanswer);
    }
    catch(err){
        res.status(400).json({message:err.message});
    }
};
// Get all answers
exports.getallanswers=async(req,res)=>{
    try{
        const answers=await answer.find().populate('question');
        res.status(200).json(answers);
    }
    catch(err){
        res.status(400).json({message:err.message});
    }
};
// Update an answer
exports.updateanswer=async(req,res)=>{
    try{
        const updateanswer=await answer.findByIdAndUpdate(req.params.id,req.body,{new:true});
        res.status(200).json(updateanswer);
    }
    catch(err){
        res.status(400).json({message:err.message});
    }
};
// Delete an answer
exports.deleteanswer=async(req,res)=>{
    try{
        const deletedanswer=await answer.findByIdAndDelete(req.params.id);
        res.status(200).json(deletedanswer);
    }
    catch(err){
        res.status(400).json({message:err.message});
    }
};

exports.getAnswersByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const answers = await answer
      .find({ userId: studentId })
      .populate("questionId")
      .populate("userId")
      .populate("examId");

    res.status(200).json({ answers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

