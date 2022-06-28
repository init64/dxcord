let voiceData = {};

module.exports = class VoiceStateUpdate {
	constructor (client) {
		this.client = client;
	}

	async run(oldState, newState) {
        let userId = newState.member.user.id,
            user = await this.client.db.users.findOne({ userId });

        let setVoice = () => {
            if (!voiceData[userId]) return;
            let seconds = Math.floor((new Date().getTime() - new Date(voiceData[userId]?.joinedAt).getTime()) / 1000),
                date = new Date(),
                day = date.getDate(),
                month = date.getMonth() + 1,
                year = date.getFullYear();
            if (!user) {
                new this.client.db.users({
                    userId,
                    inVoice: [{
                        day, month, year,
                        channels: [{
                            channelId: voiceData[userId].channelId,
                            total: seconds
                        }]
                    }]
                }).save();
            } else {
                let voice = user.inVoice.find(date => date.day === day && date.month === month && date.year === year);
                if (voice) {
                    let channel = voice.channels.find(({ channelId }) => channelId === voiceData[userId].channelId);
                    if (channel) channel.total += seconds;
                    else voice.channels = [...voice.channels, { channelId: voiceData[userId].channelId, total: seconds }];
                } else user.inVoice = [...user.inVoice, { day, month, year, channels: [{ channelId: voiceData[userId].channelId, total: seconds }] }];
                user.save();
            }
            delete voiceData[userId];
            this.client.logs.voice('leave', oldState.member, oldState.channel);
        }

        if (oldState.channelId === null) {
            voiceData[userId] = {
                joinedAt: Date.now(),
                channelId: newState.channelId
            }

            this.client.logs.voice('join', oldState.member, newState.channel);
        } else if (oldState.channelId !== null && newState.channelId !== null) {
            setVoice();

            voiceData[userId] = {
                joinedAt: Date.now(),
                channelId: newState.channelId
            }

            this.client.logs.voice('switch', newState.member, oldState.channel, newState.channel);
        } else if (newState.channelId === null) setVoice();
	}
}