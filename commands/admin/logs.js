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
            memberPermissions: ['dev'],
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
                ...message.guild.channels.cache.filter(channel => channel.type === 'GUILD_TEXT').map(channel => {
                    return { emoji: '#️⃣', label: channel.name, description: 'Channel text', value: channel.id }
                })
            ])
        let menu = new MessageActionRow()
            .addComponents(channelId)
        message.channel.send({ content: '))', components: [menu] });
        // ...message.guild.channels.cache.map(channel => {
            // return { label: channel.name, value: channel.id }
        // })
    }
}