import { type Client, type Message } from 'discord.js';

export default class Event {
    client: Client;

	constructor(client: Client) {
		this.client = client;
	}

	async run(message: Message) {
        if (message.author.bot) return;
        
        // message.channel.send('wait');
	}
}