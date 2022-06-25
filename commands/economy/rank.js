const
    Command = require('../../base/Command.js'),
    { MessageEmbed, MessageSelectMenu, MessageActionRow } = require('discord.js');

module.exports = class Rank extends Command {
    constructor(client) {
        super(client, {
            name: 'rank',
            description: '',
            dirname: __dirname,
            emoji: '',
            aliases: ['account', 'profile']
        });

        this.client = client;
    }

    async run(message, args) {
        let user = await this.client.db.users.findOne({ userId: message.member.id }),
            embedAccount = new MessageEmbed().setTimestamp();
        if (user) {
            let date = new Date(),
                dd = date.getDay(),
                mm = date.getMonth() + 1,
                yy = date.getFullYear(),
                getTime = s => {
                    let d = Math.floor(s / 86400);
                        s -= d * 86400;
                    let h = Math.floor(s / 3600);
                        s -= h * 3600;
                    let m = Math.floor(s / 60);
                        s -= m * 60;
                    return (d > 0 ? `${d}d ` : '') + (h > 0 ? `${h}h ` : '') + (m > 0 ? `${m}m ` : '') + `${s}s`;
                };
            embedAccount
                .setAuthor({
                    iconURL: message.member.user.displayAvatarURL(),
                    name: `${message.member.user.tag} [${message.member.nickname}]`
                })
                .setDescription(`**Time in voice chat:**\n`)
                .addField(`For all the time`, `**\` ${getTime(user.inVoice.map(day => day.total).reduce((a, b) => a + b, 0))} \`**`, true)
                .addField(`Per month`, `**\` ${getTime(user.inVoice.filter(({ month, year }) => month === mm && year === yy).map(day => day.total).reduce((a, b) => a + b, 0))} \`**`, true)
                .addField(`For today`, `**\` ${getTime(user.inVoice.filter(({ day, month, year }) => day === dd && month === mm && year === yy).map(day => day.total).reduce((a, b) => a + b, 0))} \`**`, true)
                .addField(`Status`, `${user.status}`)
                .setColor('#2f3136')
        } else {
            embedAccount
                .setDescription(`<@${message.member.id}>: So far there is no information about you.`)
                .setColor('#f64072')
        }
            
        message.channel.send({ embeds: [embedAccount] }).then(m => user ? null : setTimeout(() => m.delete(), 5000));
    }
}