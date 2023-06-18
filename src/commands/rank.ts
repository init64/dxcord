import {
    ChatInputCommandInteraction,
    Client,
    ApplicationCommandOptionType,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    InteractionResponse,
    ButtonInteraction
} from 'discord.js';

import { ChatCommand } from '../types/Command';

import voiceModel, { IVisit } from '../models/voice';
import userModel from '../models/user';

let users: { [key: string]: { userId: string, voiceId: string } } = {};

interface IUserTimeChannels {
    [key: string]: {
        total: number;
        list: Array<IVisit>;
    }
}

interface IUserTime {
    total: number;
    list: Array<IVisit>;
    channels: IUserTimeChannels;
}

export default class Command extends ChatCommand {
    client: Client;
    category: 'account' | 'user' | 'time' = 'account';

    constructor(client: Client) {
        super({
            name: 'rank',
            description: 'Replies with Pong!',
            options: [
                {
                    name: 'user',
                    description: 'User',
                    type: ApplicationCommandOptionType.User,
                },
                {
                    name: 'channel',
                    description: 'Channel',
                    type: ApplicationCommandOptionType.Channel
                }
            ],
            interactionEvents: true
        });

        this.client = client;
    }

    async interaction(args: Array<string>, interaction: ButtonInteraction) {
        switch(args[0]) {
            case "account":
                this.category = 'account';
                interaction.update({ embeds: [await this.embedAccount(interaction.message.interaction.id)], components: [this.buttons() as any] });
                break;
            case "time":
                this.category = 'time';
                interaction.update({ embeds: [await this.embedUserTime(interaction)], components: [this.buttons() as any] });
                break;
            case "user":
                this.category = 'user';
                interaction.update({ embeds: [this.embedUserServerInfo(interaction)], components: [this.buttons() as any] });
                break;
            // case "month":
            //     interaction.update(await this.embedChannel(interaction, interaction.values[0]));
            //     break;
        }
    }

    getTime(s: number) {
        let d = Math.floor(s / 86400);
            s -= d * 86400;
        let h = Math.floor(s / 3600);
            s -= h * 3600;
        let m = Math.floor(s / 60);
            s -= m * 60;
        return (d > 0 ? `${d}d ` : '') + (h > 0 ? `${h}h ` : '') + (m > 0 ? `${m}m ` : '') + `${s}s`;
    }

    async getUserTime(userId: string) {
        const user = await userModel.user(userId);

        const voices = await voiceModel.find({ user: user._id });

        let total = 0,
            channels: IUserTimeChannels = {} as any,
            month: IUserTime = { channels: {} } as any,
            today: IUserTime = { channels: {} } as any,
            date = new Date(),
            year = date.getFullYear();

        for (let voice of voices) {
            if (!channels[voice.voiceId]) channels[voice.voiceId] = { total: 0, list: [] }

            for (let day of voice.visits) {
                const d = new Date(day.joinedAt);

                total += day.seconds;
                channels[voice.voiceId].total = total;
                channels[voice.voiceId].list = [...channels[voice.voiceId].list || [], day];

                if (d <= new Date(year, date.getMonth() + 1)) {
                    month.total += day.seconds;
                    month.list = [...month.list || [], day];

                    if (!month.channels[voice.voiceId]) month.channels[voice.voiceId] = { total: 0, list: [] };

                    month.channels[voice.voiceId].total += day.seconds;
                    month.channels[voice.voiceId].list = [...month.channels[voice.voiceId].list || [], day];
                }

                if (d <= new Date(year, date.getMonth() + 1, date.getDate())) {
                    today.total += day.seconds;
                    today.list = [...today.list || [], day];

                    if (!today.channels[voice.voiceId]) today.channels[voice.voiceId] = { total: 0, list: [] };

                    today.channels[voice.voiceId].total += day.seconds;
                    today.channels[voice.voiceId].list = [...today.channels[voice.voiceId].list || [], day];
                }
            }
        }

        return {
            all: { total, list: voices, channels },
            month,
            today
        }
    }

    async embedAccount(id: string) {
        if (!users[id]) return {};

        const { userId } = users[id];

        const
            { all, month, today } = await this.getUserTime(userId),
            embedAccount = new EmbedBuilder().setTimestamp(),
            member = this.client.users.cache.get(userId);
            
        if (all.list.length > 0) {
            embedAccount
                .setAuthor({
                    iconURL: member.displayAvatarURL(),
                    name: member.username
                })
                .setDescription(`**Time in voice chat:**\n`)
                .addFields(
                    { name: 'For all the time', value: `**\` ${this.getTime(all.total)} \`**`, inline: true },
                    { name: 'Per month', value: `**\` ${this.getTime(month.total || 0)} \`**`, inline: true },
                    { name: 'For today', value: `**\` ${this.getTime(today.total || 0)} \`**`, inline: true }
                )
                // .addField(`Permissions`, user.roles.map(role => `**${this.roles[role]}**`).join(', '))
                .setColor('#2f3136')
        } else {
            embedAccount
                .setDescription(`<@${userId}>: So far there is no information about you.`)
                .setColor('#f64072');
        }

        return embedAccount;
    }

    async embedUserTime(interaction: ButtonInteraction) {
        if (!users[interaction.message.interaction.id]) return;

        const { userId } = users[interaction.message.interaction.id];

        const
            { all, month, today } = await this.getUserTime(userId),
            member = this.client.users.cache.get(interaction.user.id);

        const getList = (channels: IUserTimeChannels) => {
            if (Object.keys(channels).length < 1) return '` So far there is nothing here `';

            let list: any[] = [];

            for (let channel in channels) {
                list = [...list || [], { id: channel, total: channels[channel].total }];
            }

            return list.sort((a, b) => b.total - a.total).map(({ id, total }) => `<#${id}> ➜ \` ${this.getTime(total)} \``).join('\n');
        }

        return new EmbedBuilder()
            .setAuthor({
                iconURL: member?.displayAvatarURL(),
                name: member.username
            })
            .setTitle(`User time in channels`)
            .setDescription(`Find out which channels you spent the most time on.`)
            .addFields(
                { name: 'For all the time', value: getList(all.channels), inline: true },
                { name: 'Per month', value: getList(month.channels), inline: true },
                { name: 'For today', value: getList(today.channels), inline: true }
            )
            .setTimestamp();
    }

    embedUserServerInfo(interaction: ButtonInteraction) {
        if (!users[interaction.message.interaction.id]) return;

        const user = this.client.users.cache.get(users[interaction.message.interaction.id].userId);

        if (!user) return new EmbedBuilder()
            .setDescription(`<@${user.id}>: So far there is no information about you.`)
            .setColor('#f64072')
            .setTimestamp()

        return new EmbedBuilder()
            .setAuthor({
                iconURL: user?.displayAvatarURL(),
                name: user?.username
            })
            .setTitle(`User information`)
            // .addFields(
            //     { name: '', value: '', inline: true }
            // )
            // .addField(`Created At`, this.client.timeago(user?.user.createdAt), true)
            // .addField(`Joined At`, this.client.timeago(user?.joinedAt), true)
            // .addField(`Roles [${user.roles.cache.size}]`, user.roles.cache.map(role => `<@&${role.id}>`).join(' '), true)
            // .addField(`Color`, user.colo, true)
            .setThumbnail(user?.banner ? user?.bannerURL() : null)
            .setTimestamp();
    }

    async embedChannel(interaction: ButtonInteraction, month: number = new Date().getMonth() + 1) {
        if (!users[interaction.message.interaction.id]) return;

        const { userId, voiceId } = users[interaction.message.interaction.id];

        let member = this.client.users.cache.get(interaction.user.id),
            _month = Math.floor(month),
            monthName = ['january', 'february', 'martha', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
            monthEmoji = ['❄️️', '🥶', '🌷', '🌺', '🐝', '🌈', '🌞', '🍎', '🌦', '🍁', '🍂', '🎄'];

        const error = (text: string) => ({
            embeds: [new EmbedBuilder().setDescription(text).setColor('Red')],
            components: [] as any
        });

        if (!voiceId) return error(`Couldn't find such a channel, try again.`);
        if (!userId) return error(`Couldn't find such a user, try again.`);

        const
            date = new Date(),
            day = date.getDate(),
            year = date.getFullYear();

        const voices = await voiceModel.find({ userId, voiceId, createdAt: {
            $gte: new Date(year, _month, day),
            $lt: new Date(year, _month, day)
        } });

        const embed = new EmbedBuilder()
            .setAuthor({
                iconURL: member?.displayAvatarURL(),
                name: member?.username
            })
            .setDescription(
                `See how long you spent in voice chat <#${voiceId}> in **${monthEmoji[_month - 1]} ${monthName[_month - 1]}**\n\n` +
                voices.map(day => {
                    const d = new Date(day.createdAt);

                    let total = 0;
                    for (let v of day.visits) {
                        total += v.seconds;
                    }

                    return `**Day:** ${d.getDate()} ➜ \` ${this.getTime(total)} \``
                }).join('\n') || `You haven't been in voice channels yet :(`
            )
            .setTimestamp();

        // const selectMonth = new StringSelectMenuBuilder()
        //     .setCustomId('rank:month')
        //     .setPlaceholder('Select the month for which you want to view statistics')
        //     .addOptions([
        //         ...[...new Set(list.map(ch => Math.floor(ch.month)))].map(ch => Object({
        //             value: `${ch}`,
        //             label: monthName[ch - 1][0].toUpperCase() + monthName[ch - 1].slice(1),
        //             emoji: monthEmoji[ch - 1],
        //             description: `${list.filter(x => x.month === ch).length} days`,
        //             default: ch === _month
        //         }))
        //     ]);

        return {
            embeds: [embed],
            // components: [new ActionRowBuilder().addComponents(selectMonth)]
        }
    }

    buttons() {
        const style = (name: 'account' | 'user' | 'time') => this.category === name ? ButtonStyle.Secondary : ButtonStyle.Primary;

        const buttonAccount = new ButtonBuilder()
            .setLabel('Account')
            .setCustomId('rank:account')
            .setStyle(style('account'))
            .setEmoji('👤')
            .setDisabled(this.category === 'account');

        const buttonUserTime = new ButtonBuilder()
            .setLabel('Time in channels')
            .setCustomId('rank:time')
            .setStyle(style('time'))
            .setEmoji('🕙')
            .setDisabled(this.category === 'time');

        const buttonServerInfo = new ButtonBuilder()
            .setLabel('User information')
            .setCustomId('rank:user')
            .setStyle(style('user'))
            .setEmoji('✨')
            .setDisabled(this.category === 'user');

        return new ActionRowBuilder()
            .addComponents(buttonAccount, buttonUserTime, buttonServerInfo);
    }

    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const
            user = interaction.options.getUser('user') || interaction.user,
            channel = interaction.options.getChannel('channel');

        // this.category = message.content.slice(this.client.prefix.length).split(' ')[0] === 'user' ? 'user' : 'account';
        // message.channel.send({ embeds: [new MessageEmbed().setFooter('.')] }).then(async m => {
        //     this.users[m.id] = { userId, channelId };
        //     m.edit(channelId ? await this.embedChannel(m) : {
        //         embeds: [this.category === 'account' ? await this.embedAccount(m) :  await this.embedUserServerInfo(m)],
        //         components: [this.buttons()]
        //     });
        // });
        
        interaction.reply({
            embeds: [new EmbedBuilder().setFooter({ text: 'Loading...' })]
        }).then(async m => {
            users[m.id] = { userId: user.id, voiceId: channel?.id };

            console.log(1, m.id);
            

            m.edit(channel?.id ? await this.embedChannel(m as any) : {
                embeds: [this.category === 'account' ? await this.embedAccount(m.id) :  await this.embedUserServerInfo(m as any)],
                components: [this.buttons() as any]
            });
        });
    }
}