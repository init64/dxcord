let voiceData = {};

module.exports = class VoiceStateUpdate {
	constructor (client) {
		this.client = client;
	}

	async run(oldState, newState) {
        let userId = newState.member.user.id,
            user = await this.client.db.users.findOne({ userId });

        if (oldState.channelId === null) {
            voiceData[userId] = {
                joinedAt: Date.now()
            }

            this.client.logs.voice('join', oldState.member, newState.channel);
        } else if (oldState.channelId !== null && newState.channelId !== null) {
            this.client.logs.voice('switch', newState.member, oldState.channel, newState.channel);
        } else if (newState.channelId === null) {
            if (!voiceData[userId]) return;
            let date = new Date(Date.now() - voiceData[userId]?.joinedAt),
                _date = new Date(),
                day = _date.getDay(),
                month = _date.getMonth() + 1,
                year = _date.getFullYear();
            if (!user) {
                new this.client.db.users({
                    userId,
                    inVoice: [{
                        day, month, year,
                        total: date.getSeconds()
                    }]
                }).save();
            } else {
                let voice = user.inVoice.find(date => date.day === day && date.month === month && date.year === year)
                if (voice) voice.total += date.getSeconds();
                else user.inVoice = [...user.inVoice, { day, month, year, total: date.getSeconds() }];
                user.save();
            }
            delete voiceData[userId];
            this.client.logs.voice('leave', oldState.member, oldState.channel);
        }
	}
}