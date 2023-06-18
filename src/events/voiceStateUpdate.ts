import { Client, VoiceState } from "discord.js";

import { Schema } from "mongoose";

import userModel from '../models/user';
import voiceModel from '../models/voice';

export interface IVoiceData {
    [key: string]: {
        channelId: string;
        joinedAt: Date;
    }
}

let voiceData: IVoiceData = {};

module.exports = class VoiceStateUpdate {
    client: Client;

	constructor(client: Client) {
		this.client = client;
	}

    async setVoice(userId: string, voiceId: string) {
        const
            reqUser = await userModel.user(userId),
            user = voiceData[userId];

        if (!reqUser?.userId || !user || !voiceId) return;

        const
            date = new Date(),
            year = date.getFullYear(),
            month = date.getMonth(),
            day = date.getDate(),
            seconds = Math.floor((date.getTime() - new Date(voiceData[userId]?.joinedAt).getTime()) / 1000);

        if (seconds < 1) return;

        const voice = await voiceModel.findOne({ user: reqUser._id, voiceId, createdAt: {
            $gte: new Date(year, month, day),
            $lt: new Date(year, month, day + 1)
        } });

        if (!voice) {
            const newVoice = new voiceModel({
                user: reqUser._id,
                voiceId,
                visits: [{
                    seconds,
                    joinedAt: user.joinedAt,
                    leavedAt: date
                }]
            });

            newVoice.save();
        } else {
            voice.visits.push({
                seconds,
                joinedAt: user.joinedAt,
                leavedAt: date
            });

            voice.save();
        }
        
        delete voiceData[userId];
    }

	async run(oldState: VoiceState, newState: VoiceState) {
        const userId = newState.member.user.id;

        if (oldState.channelId === null) {
            voiceData[userId] = {
                joinedAt: new Date(),
                channelId: newState.channelId
            }

            // this.client.logs.voice('join', oldState.member, newState.channel);
        } else if (oldState.channelId !== null && newState.channelId !== null) {
            this.setVoice(userId, oldState.channelId);

            voiceData[userId] = {
                joinedAt: new Date(),
                channelId: newState.channelId
            }

            // this.client.logs.voice('switch', newState.member, oldState.channel, newState.channel);
        } else if (newState.channelId === null) this.setVoice(userId, oldState.channelId);
	}
}