import {
    type ChatInputCommandInteraction,
    type Client,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    EmbedBuilder
} from 'discord.js';

import os from 'os';

import { ChatCommand } from '../types/Command';

export default class Command extends ChatCommand {
    client: Client;
    NO: string = ' ᠌';
    category: 'about' | 'system' = 'about';

    constructor(client: Client) {
        super({
            name: 'about',
            description: 'Learn a little more about the bot',
            aliases: [{
                name: 'system',
                description: 'Find out the load on the server'
            }],
            interactionEvents: true
        });

        this.client = client;
    }

    async interaction(args: Array<string>, interaction: any) {
        switch(args[0]) {
            case "about":
                this.category = 'about';
                interaction.update({ embeds: [this.embedAbout()], components: [this.buttons()] });
                break;
            case "system":
                this.category = 'system';
                interaction.update({ embeds: [await this.embedSystem(interaction.message)], components: [this.buttons()] });
                break;
        }
    }

    formatBytes(bytes: number, decimals: number = 2) {
        if (bytes === 0) return '0 Bytes';
        let k = 1024,
            dm = decimals < 0 ? 0 : decimals,
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
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

    embedAbout() {
        return new EmbedBuilder()
            .setAuthor({
                iconURL: this.client.user.displayAvatarURL(),
                name: `${this.client.user.username}`
            })
            .setDescription(`This is a personal discord bot created specifically for [dsx.ninja](https://dsx.ninja).`)
            .addFields(
                { name: 'Authors:', value: `**Developer:**\n<@858612408818073620>\n[Open website](https://heito.xyz)`, inline: true },
                { name: this.NO, value: `**Assistant:**\n<@500386499443818496>\n[Open website](https://dxv1d.dsx.ninja)`, inline: true },
                { name: this.NO, value: this.NO, inline: true },
                { name: `Our other projects:`, value: `[dsx.ninja [Our website]](https://dsx.ninja)\n[Genkan [Social Network]](https://genkan.xyz)\n[Git Server](https://git.dsx.ninja)`, inline: true },
                { name: this.NO, value: `[Jynx [Chat Service]](https://chat.dsx.ninja)\n[GitHub](https://github.com/dsxninja)`, inline: true },
            )
            .setColor('#2f3136')
            .setTimestamp();
    }

    async embedSystem(integration: ChatInputCommandInteraction) {
        let memoryPercent = 100 * os.totalmem() / (os.totalmem() + os.freemem()),
            messageUrl = `https://discord.com/channels/${integration.guildId}/${integration.channelId}/${integration.id}`;

        return new EmbedBuilder()
            .setTitle('System')
            .setDescription(`Find out about the system on which the <@${this.client.user.id}> is located.`)
            .addFields(
                { name: `Arch`, value: `\` ${os.release()} \` │ \` ${os.arch()} \``, inline: true },
                { name: `Platform`, value: `${os.platform()}`, inline: true },
                { name: `Server uptime`, value: `\` ${this.getTime(Math.floor(os.uptime()))} \``, inline: true },
                { name: `Memory`, value: `**\` ${this.formatBytes(os.totalmem() - os.freemem())} \` [${`▇`.repeat(Number(`${memoryPercent}`[0]))} ${Math.floor(memoryPercent)}%](${messageUrl}) ${`▇`.repeat(10 - Number(`${memoryPercent}`[0]))} \` ${this.formatBytes(os.totalmem())} \`**` }
            )
            .setColor('#2f3136')
            .setTimestamp();
    }

    buttons() {
        const style = (name: 'about' | 'system') => this.category === name ? ButtonStyle.Secondary : ButtonStyle.Primary;

        const buttonAbout = new ButtonBuilder()
            .setLabel('About')
            .setCustomId('about:about')
            .setStyle(style('about'))
            .setEmoji('🫖')
            .setDisabled(this.category === 'about');

        const buttonSystem = new ButtonBuilder()
            .setLabel('System')
            .setCustomId('about:system')
            .setStyle(style('system'))
            .setEmoji('⚙️')
            .setDisabled(this.category === 'system');

        return new ActionRowBuilder()
            .addComponents(buttonAbout, buttonSystem);
    }

    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        this.category = interaction.commandName as any;
        
        interaction.reply({
            embeds: [this.category === 'about' ? this.embedAbout() : await this.embedSystem(interaction)],
            components: [this.buttons() as any]
        });
    }
}