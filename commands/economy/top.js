const
    Command = require('../../base/Command.js'),
    { MessageEmbed, MessageButton, MessageActionRow, Message } = require('discord.js');

module.exports = class Rank extends Command {
    constructor(client) {
        super(client, {
            name: 'top',
            description: 'Find out the leaderboard all over the server',
            dirname: __dirname,
            emoji: '🌏',
            aliases: [],
            interactionEvents: true
        });

        this.client = client;
    
        this.category = 'all_time'
    }

    async interaction(args, interaction) {
        switch(args[0]) {
            case "all_time":
                this.category = 'all_time';
                interaction.update({ embeds: [await this.embedAllTime()], components: [this.buttons()] });
                break;
            case "month":
                this.category = 'month';
                interaction.update({ embeds: [await this.embedMonth()], components: [this.buttons()] });
                break;
            case "today":
                this.category = 'today';
                interaction.update({ embeds: [await this.embedToday()], components: [this.buttons()] });
                break;
        }
    }

    nowDate() {
        let date = new Date(),
            day = date.getDate(),
            month = date.getMonth() + 1,
            year = date.getFullYear();
        return {
            date,
            day,
            month,
            year
        }
    }

    createEmbed(top, text) {
        return new MessageEmbed()
            .setAuthor({
                iconURL: this.client.bot.user.displayAvatarURL(),
                name: this.client.bot.user.username,
                url: 'https://dsx.ninja'
            })
            .setDescription(`Find out who is the leader in the amount\nof time spent in voice chat for **${text}**.`)
            .addField(' ᠌', top.map((x, i) => `**${i + 1}.** <@${x.userId}> ➜ \` ${this.client.getTime(x.total)} \``).join('\n'))
            .setTimestamp()
    }

    async embedAllTime() {
        let top = await this.client.db.users.aggregate([
            {
                $project: {
                    userId: 1,
                    roles: 1,
                    inVoice: 1,
                    total: {
                        $sum: {
                            $map: {
                                input: '$inVoice',
                                in: {
                                    $reduce: {
                                        input: '$$this.channels.total',
                                        initialValue: 0,
                                        in: { $add: ['$$value', '$$this'] }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            { $sort: { 'total': -1 } },
            { $limit: 10 }
        ]);

        return this.createEmbed(top, 'all time');
    }

    async embedMonth() {
        let { month, year } = this.nowDate(),
            top = await this.client.db.users.aggregate([
            { $match: { 'inVoice.month': month, 'inVoice.year': year } },
            {
                $project: {
                    userId: 1,
                    roles: 1,
                    inVoice: 1,
                    total: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: '$inVoice',
                                        cond: {
                                            $and: [
                                                { $eq: ['$$this.month', month] },
                                                { $eq: ['$$this.year', year] }
                                            ]
                                        }
                                    }
                                },
                                in: {
                                    $reduce: {
                                        input: '$$this.channels.total',
                                        initialValue: 0,
                                        in: { $add: ['$$value', '$$this'] }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            { $sort: { 'total': -1 } },
            { $limit: 10 }
        ]);

        return this.createEmbed(top, 'month');
    }

    async embedToday() {
        let { day, month, year } = this.nowDate(),
            top = await this.client.db.users.aggregate([
            { $match: { 'inVoice.day': day, 'inVoice.month': month, 'inVoice.year': year } },
            {
                $project: {
                    userId: 1,
                    roles: 1,
                    inVoice: 1,
                    total: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: '$inVoice',
                                        cond: {
                                            $and: [
                                                { $eq: ['$$this.day', day] },
                                                { $eq: ['$$this.month', month] },
                                                { $eq: ['$$this.year', year] }
                                            ]
                                        }
                                    }
                                },
                                in: {
                                    $reduce: {
                                        input: '$$this.channels.total',
                                        initialValue: 0,
                                        in: { $add: ['$$value', '$$this'] }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            { $sort: { 'total': -1 } },
            { $limit: 10 }
        ]);

        return this.createEmbed(top, 'today');
    }

    buttons() {
        let buttonAllTime = new MessageButton()
            .setLabel('All time')
            .setCustomId('top:all_time')
            .setStyle(this.category === 'all_time' ? 'SECONDARY' : 'PRIMARY')
            .setEmoji('⌛')
            .setDisabled(this.category === 'all_time');
        let buttonMonth = new MessageButton()
            .setLabel('Month')
            .setCustomId('top:month')
            .setStyle(this.category === 'month' ? 'SECONDARY' : 'PRIMARY')
            .setEmoji('📅')
            .setDisabled(this.category === 'month');
        let buttonToday = new MessageButton()
            .setLabel('Today')
            .setCustomId('top:today')
            .setStyle(this.category === 'today' ? 'SECONDARY' : 'PRIMARY')
            .setEmoji('🗓️')
            .setDisabled(this.category === 'today');
        return new MessageActionRow()
            .addComponents(buttonAllTime)
            .addComponents(buttonMonth)
            .addComponents(buttonToday);
    }

    async run(message) {
        // this.category = message.content.slice(this.client.prefix.length).split(' ')[0] === 'user' ? 'user' : 'account';
        message.channel.send({
            embeds: [await this.embedAllTime()],
            components: [this.buttons()]
        });
    }
}