const
    Command = require('../../base/Command.js'),
    { MessageEmbed, MessageSelectMenu, MessageActionRow } = require('discord.js');

module.exports = class Logs extends Command {
    constructor(client) {
        super(client, {
            name: 'logs',
            description: '',
            dirname: __dirname,
            emoji: '',
            memberPermissions: ['m', 'a', 'd'],
            aliases: ['log'],
            hide: true
        });

        this.client = client;
    }

    async run(message, args) {
        let channelId = new MessageSelectMenu()
            .setCustomId('select:logs:channel_id')
            .setPlaceholder('Select a channel for logging')
            .addOptions([
                { label: 'Disable', description: 'Disable logging', value: 'logs:disable', emoji: '🔴' },
                ...message.guild.channels.cache.filter(channel => channel.type === 'GUILD_TEXT').map(channel => {
                    return { emoji: '#️⃣', label: channel.name, description: 'Channel text', value: channel.id }
                })
            ])
        let menu = new MessageActionRow()
            .addComponents(channelId)
        message.channel.send({ components: [menu] });
    }
}