const
    Command = require('../../base/Command.js'),
    { MessageEmbed } = require('discord.js');

module.exports = class Help extends Command {
    constructor(client) {
        super(client, {
            name: 'help',
            description: 'Find out the entire list of commands.',
            dirname: __dirname,
            emoji: '🆘',
            aliases: ['h'],
            nsfw: false,
            hide: true
        });

        this.client = client;
    }

    async run(message, args) {
        let embed = new MessageEmbed()
            .setTitle('Help Menu')
            .setDescription(`**Prefix:** \` ${this.client.prefix} \``)
            .setColor('#FFB433')
            .addFields([
                ...this.client.commands.filter(cmd => !cmd.config.hide).map(cmd => {
                    let cfg = cmd.config;
                    return { name: (cfg.emoji ? `${cfg.emoji} ` : '') + cfg.name, value: cfg.description || '` My heart is empty `', inline: true }
                })
            ])
            .setTimestamp();
        message.channel.send({ embeds: [embed] });
    }
}