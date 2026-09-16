const subject = require("../models/subject");
exports.createsubject = async (req, res) => {
    try {
        const newsubject = await subject.create(req.body);
        res.status(200).json(newsubject);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
// all subjects
exports.getallsubjects = async (req, res) => {
    try {
        const subjects = await subject.find();  
        res.status(200).json(subjects);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
// update subject
exports.updatesubject = async (req, res) => {
    try {
        const updatesubject=await subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatesubject);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
// delete subject
exports.deletesubject = async (req, res) => {
    try {
        const deletedsubject = await subject.findByIdAndDelete(req.params.id);
        res.status(200).json(deletedsubject);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};

