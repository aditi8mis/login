const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');


router.get('/', async (req, res) => {
const data = await Feedback.find();
res.json(data);
});


module.exports = router;