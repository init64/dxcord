const
    Command = require('../../base/Command.js'),
    { MessageEmbed, MessageButton, MessageActionRow, Message } = require('discord.js');

let channels = {};

module.exports = class Rank extends Command {
    constructor(client) {
        super(client, {
            name: 'channel',
            description: 'Find out the leaderboard on a specific channel',
            dirname: __dirname,
            emoji: '🔊',
            aliases: ['ch'],
            interactionEvents: true
        });

        this.client = client;
    
        this.category = 'all_time';

        this.channels = channels;
    }

    async interaction(args, interaction) {
        switch(args[0]) {
            case "all_time":
                this.category = 'all_time';
                interaction.update({ embeds: [await this.embedAllTime(interaction.message)], components: [this.buttons()] });
                break;
            case "month":
                this.category = 'month';
                interaction.update({ embeds: [await this.embedMonth(interaction.message)], components: [this.buttons()] });
                break;
            case "today":
                this.category = 'today';
                interaction.update({ embeds: [await this.embedToday(interaction.message)], components: [this.buttons()] });
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

    createEmbed(top, text, channelId) {
        return new MessageEmbed()
            .setAuthor({
                iconURL: this.client.bot.user.displayAvatarURL(),
                name: this.client.bot.user.username,
                url: 'https://dsx.ninja'
            })
            .setDescription(`Find out who is the leader in the amount\nof time spent in voice chat <#${channelId}> for **${text}**.`)
            .addField(' ᠌', top.map((x, i) => `**${i + 1}.** <@${x.userId}> ➜ \` ${this.client.getTime(x.total)} \``).join('\n'))
            .setTimestamp()
    }

    async embedAllTime(message) {
        let channelId = this.channels[message.id],
            top = await this.client.db.users.aggregate([
            { $match: { 'inVoice.channels.channelId': channelId } },
            {
                $project: {
                    userId: 1,
                    roles: 1,
                    inVoice: 1,
                    total: {
                        $reduce: {
                            input: {
                                $map: {
                                    input: '$inVoice',
                                    in: { $ifNull: [{
                                        $arrayElemAt: [{
                                            $filter: {
                                                input: '$$this.channels',
                                                cond: {
                                                    $eq: ['$$this.channelId', channelId]
                                                }
                                            }
                                        }, 0.0]
                                    }, { total: 0 }] },
                                }
                            },
                            initialValue: 0,
                            in: { $add: ['$$value', '$$this.total'] }
                        }
                    }
                }
            },
            { $sort: { 'total': -1 } },
            { $limit: 10 }
        ]);

        return this.createEmbed(top, 'all time', channelId);
    }

    async embedMonth(message) {
        let { month, year } = this.nowDate(),
            channelId = this.channels[message.id],
            top = await this.client.db.users.aggregate([
            { $match: { 'inVoice.channels.channelId': channelId } },
            {
                $project: {
                    userId: 1,
                    roles: 1,
                    inVoice: 1,
                    total: {
                        $reduce: {
                            input: {
                                $map: {
                                    input: '$inVoice',
                                    as: 'v',
                                    in: { $ifNull: [{
                                        $arrayElemAt: [{
                                            $filter: {
                                                input: '$$v.channels',
                                                cond: {
                                                    $and: [
                                                        { $eq: ['$$v.month', month] },
                                                        { $eq: ['$$v.year', year] },
                                                        { $eq: ['$$this.channelId', channelId] }
                                                    ]
                                                }
                                            }
                                        }, 0.0]
                                    }, { total: 0 }] },
                                }
                            },
                            initialValue: 0,
                            in: { $add: ['$$value', '$$this.total'] }
                        }
                    }
                }
            },
            { $sort: { 'total': -1 } },
            { $limit: 10 }
        ]);

        return this.createEmbed(top, 'month', channelId);
    }

    async embedToday(message) {
        let { day, month, year } = this.nowDate(),
            channelId = this.channels[message.id],
            top = await this.client.db.users.aggregate([
            { $match: { 'inVoice.channels.channelId': channelId } },
            {
                $project: {
                    userId: 1,
                    roles: 1,
                    inVoice: 1,
                    total: {
                        $reduce: {
                            input: {
                                $map: {
                                    input: '$inVoice',
                                    as: 'v',
                                    in: { $ifNull: [{
                                        $arrayElemAt: [{
                                            $filter: {
                                                input: '$$v.channels',
                                                cond: {
                                                    $and: [
                                                        { $eq: ['$$v.day', day] },
                                                        { $eq: ['$$v.month', month] },
                                                        { $eq: ['$$v.year', year] },
                                                        { $eq: ['$$this.channelId', channelId] }
                                                    ]
                                                }
                                            }
                                        }, 0.0]
                                    }, { total: 0 }] },
                                }
                            },
                            initialValue: 0,
                            in: { $add: ['$$value', '$$this.total'] }
                        }
                    }
                }
            },
            { $sort: { 'total': -1 } },
            { $limit: 10 }
        ]);

        return this.createEmbed(top, 'today', channelId);
    }

    buttons() {
        let buttonAllTime = new MessageButton()
            .setLabel('All time')
            .setCustomId('channel:all_time')
            .setStyle(this.category === 'all_time' ? 'SECONDARY' : 'PRIMARY')
            .setEmoji('⌛')
            .setDisabled(this.category === 'all_time');
        let buttonMonth = new MessageButton()
            .setLabel('Month')
            .setCustomId('channel:month')
            .setStyle(this.category === 'month' ? 'SECONDARY' : 'PRIMARY')
            .setEmoji('📅')
            .setDisabled(this.category === 'month');
        let buttonToday = new MessageButton()
            .setLabel('Today')
            .setCustomId('channel:today')
            .setStyle(this.category === 'today' ? 'SECONDARY' : 'PRIMARY')
            .setEmoji('🗓️')
            .setDisabled(this.category === 'today');
        return new MessageActionRow()
            .addComponents(buttonAllTime)
            .addComponents(buttonMonth)
            .addComponents(buttonToday);
    }

    async run(message, args) {
        if (!args[0]) return;
        let channelId = /<#(.*)>/.exec(args[0])[1];
        message.channel.send({ embeds: [new MessageEmbed().setFooter('.')] }).then(async m => {
            this.channels[m.id] = channelId;
            m.edit({
                embeds: [await this.embedAllTime(m)],
                components: [this.buttons()]
            });
        });
    }
}