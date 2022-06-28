const { Message, Integration } = require('discord.js');

module.exports = class Command {
	constructor(client, {
		name = null,
        description = '',
        emoji = null,
		dirname = false,
		aliases = new Array(),
		botPermissions = new Array(),
		memberPermissions = new Array(),
		nsfw = false,
        clear = true,
        hide = false,
		interactionEvents = false
	}) {
        this.config = {
			name, description, emoji, dirname,
			aliases, botPermissions, memberPermissions,
			nsfw, clear, hide, interactionEvents
		}
    }

	/**
	 * @param {Array} args
	 * @param {Integration} interaction
	*/
	interaction(args, interaction) {}

	/**
	 * @param {Message} message
	 * @param {Array} args
	*/
	run(message, args) {}
}