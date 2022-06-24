const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    userId: { type: String, required: true },
    status: { type: String, default: 'user' },
    inVoice: [{
        _id: false,
        day: { type: Number, required: true },
        month: { type: Number, required: true },
        year: { type: Number, required: true },
        total: { type: Number, default: 0, required: true }
    }]
});

module.exports = mongoose.model('users', schema);