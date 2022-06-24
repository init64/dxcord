const
    Command = require('../../base/Command.js'),
    { MessageEmbed } = require('discord.js');

module.exports = class About extends Command {
    constructor(client) {
        super(client, {
            name: 'about',
            description: 'Learn a little more about the bot',
            dirname: __dirname,
            emoji: '🫖',
            aliases: ['system']
        });

        this.client = client;
    }

    async run(message, args) {
        let NO = '';
        let about = new MessageEmbed()
            .setAuthor({
                iconURL: this.client.bot.user.displayAvatarURL(),
                name: `${this.client.bot.user.username}`
            })
            .setDescription(`This is a personal discord bot created specifically for [dsx.ninja](https://dsx.ninja).`)
            .addField(`Authors:`, `**Developer:**\n<@858612408818073620>\n[Open website](https://heito.xyz)`, true)
            .addField(NO, `**Assistant:**\n<@500386499443818496>\n[Open website](https://dxv1d.dsx.ninja)`, true)
            .addField(NO, NO, true)
            .addField(`Our other projects:`, `[dsx.ninja [Our website]](https://dsx.ninja)\n[Genkan [Social Network]](https://genkan.xyz)\n[Git Server](https://git.dsx.ninja)`, true)
            .addField(NO, `[Jynx [Chat Service]](https://chat.dsx.ninja)\n[GitHub](https://github.com/dsxninja)`, true)
            .setColor('#2f3136')
            .setTimestamp();
        let system = new MessageEmbed();
        message.channel.send({ embeds: [about] });
    }
}