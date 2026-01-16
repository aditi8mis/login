const mongoose = require('mongoose');


const FeedbackSchema = new mongoose.Schema({
message: String
});


module.exports = mongoose.model('feedback', FeedbackSchema);