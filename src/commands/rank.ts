import {
    ChatInputCommandInteraction,
    Client,
    ApplicationCommandOptionType,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    ButtonInteraction,
    User,
    ChannelType
} from 'discord.js';

import { ChatCommand } from '../types/Command';

import voiceModel, { IVisit } from '../models/voice';
import userModel from '../models/user';

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

const months = [
    ['january', '❄️️'],
    ['february', '🥶'],
    ['martha', '🌷'],
    ['april', '🌺'],
    ['may', '🐝'],
    ['june', '🌈'],
    ['july', '🌞'],
    ['august', '🍎'],
    ['september', '🌦'],
    ['october', '🍁'],
    ['november', '🍂'],
    ['december', '🎄']
];

export default class Command extends ChatCommand {
    client: Client;

    constructor(client: Client) {
        super({
            name: 'rank',
            description: 'Replies with Pong!',
            options: [
                {
                    name: 'user',
                    description: 'Select the user you want to know about',
                    type: ApplicationCommandOptionType.User,
                },
                {
                    name: 'channel',
                    description: 'Select a voice channel',
                    type: ApplicationCommandOptionType.Channel
                }
            ],
            interactionEvents: true
        });

        this.client = client;
    }

    async interaction(args: Array<string>, interaction: ButtonInteraction) {
        const
            userId = args[1],
            voiceId = args[2],
            month = isNaN(Number(args[3])) ? new Date().getMonth() + 1 : Number(args[3]),
            user = this.client.users.cache.get(userId);

        switch(args[0]) {
            case 'account':
                interaction.update({ embeds: [await this.embedAccount(user)], components: [this.buttons(user.id, args[0]) as any] });
                break;
            case 'time':
                interaction.update({ embeds: [await this.embedUserTime(user)], components: [this.buttons(userId, args[0]) as any] });
                break;
            case 'month':
                interaction.update(await this.embedChannel(user, voiceId, month));
                break;
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

    error(text: string) {
        return {
            embeds: [new EmbedBuilder().setDescription(text).setColor('Red')],
            components: [] as any
        }
    }

    async getUserTime(userId: string) {
        const user = await userModel.user(userId);

        const voices = await voiceModel.find({ user: user._id });

        let total = 0,
            allMonths: { [key: number]: { total: number; list: Array<IVisit>; } } = {},
            channels: IUserTimeChannels = {} as any,
            month: IUserTime = { channels: {} } as any,
            today: IUserTime = { channels: {} } as any,
            date = new Date(),
            year = date.getFullYear();

        for (let voice of voices) {
            if (!channels[voice.voiceId]) channels[voice.voiceId] = { total: 0, list: [] }

            for (let day of voice.visits) {
                const
                    date = new Date(day.joinedAt),
                    m = date.getMonth();

                total += day.seconds;
                channels[voice.voiceId].total = total;
                channels[voice.voiceId].list = [...channels[voice.voiceId].list || [], day];

                if (!allMonths[m]) allMonths[m] = { total: 0, list: [] }

                allMonths[m].total += day.seconds;
                allMonths[m].list = [...allMonths[m].list || [], day];

                if (date <= new Date(year, date.getMonth() + 1)) {
                    month.total += day.seconds;
                    month.list = [...month.list || [], day];

                    if (!month.channels[voice.voiceId]) month.channels[voice.voiceId] = { total: 0, list: [] };

                    month.channels[voice.voiceId].total += day.seconds;
                    month.channels[voice.voiceId].list = [...month.channels[voice.voiceId].list || [], day];
                }

                if (date <= new Date(year, date.getMonth() + 1, date.getDate())) {
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
            today,
            allMonths
        }
    }

    async embedAccount(user: User) {
        const
            { all, month, today } = await this.getUserTime(user.id),
            embedAccount = new EmbedBuilder().setTimestamp();
            
        if (all.list.length > 0) {
            embedAccount
                .setAuthor({
                    iconURL: user.displayAvatarURL(),
                    name: user.username
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
                .setDescription(`<@${user.id}>: So far there is no information about you.`)
                .setColor('#f64072');
        }

        return embedAccount;
    }

    async embedUserTime(user: User) {
        const { all, month, today } = await this.getUserTime(user.id);

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
                iconURL: user?.displayAvatarURL(),
                name: user.username
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

    async embedChannel(user: User, voiceId: string, month: number = new Date().getMonth() + 1) {
        month = Math.floor(month);

        const channel = this.client.channels.cache.get(voiceId);

        if (!user) return this.error(`Couldn't find such a user, try again.`);
        if (!voiceId) return this.error(`Couldn't find such a channel, try again.`);
        if (channel.type !== ChannelType.GuildVoice) return this.error(`<#${voiceId}> is not suitable. You need to specify the voice channel.`);

        const
            { allMonths } = await this.getUserTime(user.id),
            list = allMonths[month - 1].list;
        
        let days: { [key: number]: { seconds: number } } = {};

        for (let i = 0; i < list.length; i++) {
            const
                day = new Date(list[i].joinedAt).getDate(),
                secs = list[i].seconds;

            if (!days[day]) days[day] = { seconds: secs  }
            else days[day].seconds += secs;
        }

        const embed = new EmbedBuilder()
            .setAuthor({
                iconURL: user?.displayAvatarURL(),
                name: user?.username
            })
            .setDescription(
                `See how long you spent in voice chat <#${voiceId}> in **${months[month - 1][0]} ${months[month - 1][1]}**\n` +
                `Total: \` ${this.getTime(allMonths[month - 1].total)} \` (${Object.keys(days).length} days)\n\n` +
                Object.keys(days).map(day => {
                    return `**Day:** ${day} ➜ \` ${this.getTime(days[Number(day)].seconds)} \``
                }).join('\n') || `You haven't been in voice channels yet :(`
            )
            .setTimestamp();

        let listMonths: any[] = [];

        for (let m of months.filter((_, i) => allMonths[i]?.list?.length > 0)) {
            const i = months.findIndex(f => f[0] === m[0]);

            listMonths = [...listMonths || [], {
                label: `${m[1]} ` + m[0][0].toLocaleUpperCase() + m[0].slice(1),
                description: this.getTime(allMonths[i].total) + ` (${Object.keys(days).length} days)`,
                value: String(i),
                default: (i + 1) === month
            }];
        }

        const selectMonth = new StringSelectMenuBuilder()
            .setCustomId(`rank:month:${user.id}:${voiceId}`)
            .setPlaceholder('Select the month for which you want to view statistics')
            .addOptions(listMonths);

        const buttonBack = new ButtonBuilder()
            .setCustomId(`rank:account:${user.id}`)
            .setStyle(ButtonStyle.Secondary)
            .setLabel('Account')
            .setEmoji('👤')

        const buttonReload = new ButtonBuilder()
            .setCustomId(`rank:month:${user.id}:${voiceId}:${month}`)
            .setStyle(ButtonStyle.Success)
            .setLabel('Reload')
            .setEmoji('🔁')

        return {
            embeds: [embed],
            components: [
                new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMonth),
                new ActionRowBuilder<ButtonBuilder>().addComponents(buttonBack, buttonReload)
            ]
        }
    }

    buttons(userId: string, category: 'account' | 'time' = 'account') {
        const style = (name: 'account' | 'time') => category === name ? ButtonStyle.Secondary : ButtonStyle.Primary;

        const buttonAccount = new ButtonBuilder()
            .setLabel('Account')
            .setCustomId(`rank:account:${userId}`)
            .setStyle(style('account'))
            .setEmoji('👤')
            .setDisabled(category === 'account');

        const buttonUserTime = new ButtonBuilder()
            .setLabel('Time in channels')
            .setCustomId(`rank:time:${userId}`)
            .setStyle(style('time'))
            .setEmoji('🕙')
            .setDisabled(category === 'time');

        return new ActionRowBuilder()
            .addComponents(buttonAccount, buttonUserTime);
    }

    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const
            user = interaction.options.getUser('user') || interaction.user,
            channel = interaction.options.getChannel('channel');
        
        interaction.reply(channel?.id ? await this.embedChannel(user, channel.id) : {
            embeds: [await this.embedAccount(user)],
            components: [this.buttons(user.id) as any]
        });
    }
}