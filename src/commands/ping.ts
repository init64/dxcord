import type { ChatInputCommandInteraction, Client } from 'discord.js';
import { ChatCommand } from '../types/Command';

export default class Command extends ChatCommand {
    constructor() {
        super({
            name: 'ping',
            description: 'Replies with Pong!'
        });
    }

    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        interaction.reply('Pong!');
    }
}