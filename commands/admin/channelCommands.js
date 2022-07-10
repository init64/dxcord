const
    Command = require('../../base/Command.js'),
    { MessageEmbed, MessageSelectMenu, MessageActionRow } = require('discord.js');

module.exports = class Logs extends Command {
    constructor(client) {
        super(client, {
            name: 'commands',
            description: '',
            dirname: __dirname,
            emoji: '',
            memberPermissions: ['m', 'a', 'd'],
            hide: true,
            interactionEvents: true
        });

        this.client = client;
    }

    async interaction(args, interaction) {
        switch(args[0]) {
            case "channel_id":
                interaction.message.delete();
                let guildId = interaction.member.guild.id,
                    guild = await this.client.db.guilds.findOne({ guildId });
                if (!guild) {
                    new this.client.db.guilds({
                        guildId,
                        config: {
                            commands: {
                                channelId: interaction.values[0]
                            }
                        }
                    }).save();
                } else {
                    guild['config']['commands']['channelId'] = interaction.values[0] === 'disable' ? null : interaction.values[0];
                    guild.save();
                }
                break;
        }
    }

    async run(message, args) {
        let channelId = new MessageSelectMenu()
            .setCustomId('commands:channel_id')
            .setPlaceholder('Select a channel for commands')
            .addOptions([
                { label: 'Disable', description: 'Any channel', value: 'disable', emoji: '🔴' },
                ...message.guild.channels.cache.filter(channel => channel.type === 'GUILD_TEXT').map(channel => {
                    return { emoji: '#️⃣', label: channel.name, description: 'Channel text', value: channel.id }
                })
            ]);
        let menu = new MessageActionRow()
            .addComponents(channelId);
        message.channel.send({ components: [menu] });
    }
}