const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    guildId: { type: String, required: true },
    config: {
        logs: {
            channelId: { type: String }
        }
    }
});

module.exports = mongoose.model('guilds', schema);