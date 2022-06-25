const { MessageEmbed } = require('discord.js');

module.exports = class Message {
	constructor (client) {
		this.client = client;
	}

	async run(message) {

		if (message.author.bot) return;

		if (message.guild && !message.member)
			await message.guild.members.fetch(message.author.id);

		if (message.content.match(new RegExp(`^<@!?${this.client.bot.user.id}>( |)$`)) && message.guild) {
			return this.client.commands.get("about").run(message, []);
		}

		if (!this.client.prefix || message.content.slice(0, this.client.prefix.length) !== this.client.prefix) return;

		let args = message.content.slice(this.client.prefix.length).split(' '),
			command = args.shift().toLowerCase(),
			cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));

		if (!cmd) return;

		if (cmd.config.clear) message.delete();

		let user = await this.client.db.users.findOne({ userId: message.member.id });

		if (cmd.config.memberPermissions?.length > 0 && (!user || !cmd.config.memberPermissions.includes(user.status))) {
			let error = new MessageEmbed()
				.setDescription(`<@${message.member.id}>: You don't have enough rights for this command...`)
				.setColor('#f64072');
			return message.channel.send({ embeds: [error] }).then(m => setTimeout(() => m.delete(), 5000));
		}

		try {
			cmd.run(message, args);
		} catch(err) {
			console.error(err);
		}
	}
}