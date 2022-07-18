const
    Command = require('../../base/Command.js'),
    { MessageEmbed, MessageButton, MessageActionRow, Message, MessageSelectMenu } = require('discord.js');

let users = {};

module.exports = class Rank extends Command {
    constructor(client) {
        super(client, {
            name: 'rank',
            description: 'Find out a little more about yourself',
            dirname: __dirname,
            emoji: '📊',
            aliases: ['account', 'profile', 'uinfo', 'user'],
            interactionEvents: true
        });

        this.client = client;

        this.category = 'account';

        this.roles = {
            r: 'Read',
            w: 'Write',
            m: 'Moderator',
            a: 'Admin',
            d: 'Developer',
            o: 'Owner'
        }

        this.users = users;
    }

    async interaction(args, interaction) {
        switch(args[0]) {
            case "account":
                this.category = 'account';
                interaction.update({ embeds: [await this.embedAccount(interaction.message)], components: [this.buttons()] });
                break;
            case "time":
                this.category = 'time';
                interaction.update({ embeds: [await this.embedUserTime(interaction.message)], components: [this.buttons()] });
                break;
            case "user":
                this.category = 'user';
                interaction.update({ embeds: [this.embedUserServerInfo(interaction.message)], components: [this.buttons()] });
                break;
            case "month":
                interaction.update(await this.embedChannel(interaction.message, interaction.values[0]));
                break;
        }
    }

    getTime(user) {
        if (!user) return { all: '', month: '', today: '' }
        let date = new Date(),
            dd = date.getDate(),
            mm = date.getMonth() + 1,
            yy = date.getFullYear();
        return {
            all: user.inVoice,
            month: user.inVoice.filter(({ month, year }) => month === mm && year === yy),
            today: user.inVoice.find(({ day, month, year }) => day === dd && month === mm && year === yy)
        }
    }

    async embedAccount(message) {
        let userId = this.users[message.id].userId,
            user = await this.client.db.users.findOne({ userId }),
            embedAccount = new MessageEmbed().setTimestamp();
            
        if (user) {
            let time = this.getTime(user),
                
                allTime = time.all.map(day => day.channels.map(channel => channel.total).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0),
                monthTime = time.month.map(day => day.channels.map(channel => channel.total).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0),
                todayTime = time.today?.channels.length > 0 ? this.client.getTime(time.today.channels.map(channel => channel.total).reduce((a, b) => a + b, 0)) : 'So far there is nothing here';
            embedAccount
                .setAuthor({
                    iconURL: message.guild.members.cache.get(userId).displayAvatarURL(),
                    name: `${message.guild.members.cache.get(userId).user.tag} [${message.guild.members.cache.get(userId).nickname}]`
                })
                .setDescription(`**Time in voice chat:**\n`)
                .addField(`For all the time`, `**\` ${this.client.getTime(allTime)} \`**`, true)
                .addField(`Per month`, `**\` ${this.client.getTime(monthTime)} \`**`, true)
                .addField(`For today`, `**\` ${todayTime} \`**`, true)
                .addField(`Permissions`, user.roles.map(role => `**${this.roles[role]}**`).join(', '))
                .setColor('#2f3136')
        } else {
            embedAccount
                .setDescription(`<@${userId}>: So far there is no information about you.`)
                .setColor('#f64072')
        }

        return embedAccount;
    }

    /**
     * @param {Message} message
    */
    embedUserServerInfo(message) {
        let user = message.guild.members.cache.get(this.users[message.id].userId);
        if (!user) return new MessageEmbed()
            .setDescription(`<@${message.member.id}>: So far there is no information about you.`)
            .setColor('#f64072')
            .setTimestamp()
        return new MessageEmbed()
            .setAuthor({
                iconURL: user?.displayAvatarURL(),
                name: `${user?.user.tag} [${user?.nickname}]`
            })
            .setTitle(`User information`)
            .addField(`Created At`, this.client.timeago(user?.user.createdAt), true)
            .addField(`Joined At`, this.client.timeago(user?.joinedAt), true)
            .addField(`Roles [${user.roles.cache.size}]`, user.roles.cache.map(role => `<@&${role.id}>`).join(' '), true)
            .addField(`Color`, user.displayHexColor, true)
            .setThumbnail(user?.user.banner ? user?.user.bannerURL() : null)
            .setTimestamp();
    }

    async embedUserTime(message) {
        let userId = this.users[message.id].userId,
            user = await this.client.db.users.findOne({ userId }),
            member = message.guild.members.cache.get(userId),
            time = this.getTime(user),
            getList = arr => {
                if (!arr || arr?.length < 1) return '` So far there is nothing here `'
                let list = new Array();
                for (let { channelId, total } of arr.map(x => x.channels).reduce((a, b) => [...a, ...b], [])) {
                    let q = list.find(h => h.channelId === channelId);
                    q ? q.total += total : list = [...list, { channelId, total }]
                }
                return list.sort((a, b) => b.total - a.total).map(({ channelId, total }) => `<#${channelId}> ➜ \` ${this.client.getTime(total)} \``).join('\n')
            }
        if (!user) return new MessageEmbed()
            .setDescription(`<@${userId}>: So far there is no information about you.`)
            .setColor('#f64072')
            .setTimestamp()
        return new MessageEmbed()
            .setAuthor({
                iconURL: member?.displayAvatarURL(),
                name: `${member?.user.tag} [${member?.nickname}]`
            })
            .setTitle(`User time in channels`)
            .setDescription(`Find out which channels you spent the most time on.`)
            .addField(`For all the time`, getList(time.all), true)
            .addField(`Per month`, getList(time.month), true)
            .addField(`For today`, time.today?.channels?.length > 0 ? time.today?.channels.sort((a, b) => b.total - a.total).map(({ channelId, total }) => `<#${channelId}> ➜ \` ${this.client.getTime(total)} \``).join('\n') : '` So far there is nothing here `', true)
            .setTimestamp();
    }

    async embedChannel(message, month) {
        let userId = this.users[message.id]?.userId,
            channelId = this.users[message.id]?.channelId,
            user = await this.client.db.users.findOne({ userId }),
            member = message.guild.members.cache.get(userId),
            _month = Math.floor(month) || (new Date().getMonth() + 1),
            monthName = ['january', 'february', 'martha', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
            monthEmoji = ['❄️️', '🥶', '🌷', '🌺', '🐝', '🌈', '🌞', '🍎', '🌦', '🍁', '🍂', '🎄'];

        if (!channelId) return { embeds: [new MessageEmbed().setDescription(`Couldn't find such a channel, try again.`).setColor('RED')], components: [] }
        if (!userId) return { embeds: [new MessageEmbed().setDescription(`Couldn't find such a user, try again.`).setColor('RED')], components: [] }

        let list = user.inVoice.filter(x => x.channels.find(ch => ch.channelId === channelId));

        let embed = new MessageEmbed()
            .setAuthor({
                iconURL: member?.displayAvatarURL(),
                name: `${member?.user.tag} [${member?.nickname}]`
            })
            .setDescription(
                `See how long you spent in voice chat <#${channelId}> in **${monthEmoji[_month - 1]} ${monthName[_month - 1]}**\n\n` + 
                list.filter(x => x.month === _month).map(ch => `**Day:** ${ch.day} ➜ \` ${this.client.getTime(ch.channels.find(c => c.channelId === channelId).total)} \``).join('\n') || `You haven't been in voice channels yet :(`
            )
            .setTimestamp();

        let selectMonth = new MessageSelectMenu()
            .setCustomId('rank:month')
            .setPlaceholder('Select the month for which you want to view statistics')
            .addOptions([
                ...[
                    ...new Set(list.map(ch => Math.floor(ch.month)))
                ].map(ch => Object({
                    value: `${ch}`,
                    label: monthName[ch - 1][0].toUpperCase() + monthName[ch - 1].slice(1),
                    emoji: monthEmoji[ch - 1],
                    description: `${list.filter(x => x.month === ch).length} days`,
                    default: ch === _month
                }))
            ])
        return {
            embeds: [embed],
            components: [
                new MessageActionRow()
                    .addComponents(selectMonth)
            ]
        }
    }

    buttons() {
        let buttonAccount = new MessageButton()
            .setLabel('Account')
            .setCustomId('rank:account')
            .setStyle(this.category === 'account' ? 'SECONDARY' : 'PRIMARY')
            .setEmoji('👤')
            .setDisabled(this.category === 'account');
        let buttonUserTime = new MessageButton()
            .setLabel('Time in channels')
            .setCustomId('rank:time')
            .setStyle(this.category === 'time' ? 'SECONDARY' : 'PRIMARY')
            .setEmoji('🕙')
            .setDisabled(this.category === 'time');
        let buttonServerInfo = new MessageButton()
            .setLabel('User information')
            .setCustomId('rank:user')
            .setStyle(this.category === 'user' ? 'SECONDARY' : 'PRIMARY')
            .setEmoji('✨')
            .setDisabled(this.category === 'user');
        return new MessageActionRow()
            .addComponents(buttonAccount)
            .addComponents(buttonUserTime)
            .addComponents(buttonServerInfo);
    }

    async run(message, args) {
        let userId = args[0] ? /<@(.*)>/.exec(args[0])[1] : message.member.id,
            channelId = /<#(.*)>/.exec(args[1])[1];
        this.category = message.content.slice(this.client.prefix.length).split(' ')[0] === 'user' ? 'user' : 'account';
        message.channel.send({ embeds: [new MessageEmbed().setFooter('.')] }).then(async m => {
            this.users[m.id] = { userId, channelId };
            m.edit(channelId ? await this.embedChannel(m) : {
                embeds: [this.category === 'account' ? await this.embedAccount(m) :  await this.embedUserServerInfo(m)],
                components: [this.buttons()]
            });
        });
    }
}