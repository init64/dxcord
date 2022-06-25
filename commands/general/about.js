const
    Command = require('../../base/Command.js'),
    { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js'),
    os = require('os');

module.exports = class About extends Command {
    constructor(client) {
        super(client, {
            name: 'about',
            description: 'Learn a little more about the bot',
            dirname: __dirname,
            emoji: '🫖',
            aliases: ['system'],
            interactionEvents: true
        });

        this.client = client;

        this.category = 'about';

        this.NO = '';
    }

    async interaction(args, interaction) {
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

    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        let k = 1024,
            dm = decimals < 0 ? 0 : decimals,
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    embedAbout() {
        return new MessageEmbed()
            .setAuthor({
                iconURL: this.client.bot.user.displayAvatarURL(),
                name: `${this.client.bot.user.username}`
            })
            .setDescription(`This is a personal discord bot created specifically for [dsx.ninja](https://dsx.ninja).`)
            .addField(`Authors:`, `**Developer:**\n<@858612408818073620>\n[Open website](https://heito.xyz)`, true)
            .addField(this.NO, `**Assistant:**\n<@500386499443818496>\n[Open website](https://dxv1d.dsx.ninja)`, true)
            .addField(this.NO, this.NO, true)
            .addField(`Our other projects:`, `[dsx.ninja [Our website]](https://dsx.ninja)\n[Genkan [Social Network]](https://genkan.xyz)\n[Git Server](https://git.dsx.ninja)`, true)
            .addField(this.NO, `[Jynx [Chat Service]](https://chat.dsx.ninja)\n[GitHub](https://github.com/dsxninja)`, true)
            .setColor('#2f3136')
            .setTimestamp();
    }

    async embedSystem(message) {
        let memoryPercent = 100 * os.totalmem() / (os.totalmem() + os.freemem()),
            messageUrl = `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`;
        return new MessageEmbed()
            .setTitle('System')
            .setDescription(`Find out about the system on which the <@${this.client.bot.user.id}> is located.`)
            .addField(`Arch`, `\` ${os.release()} \` │ \` ${os.arch()} \``, true)
            .addField(`Platform`, `${os.platform()}`, true)
            .addField(`Server uptime`, `\` ${this.client.getTime(Math.floor(os.uptime()))} \``, true)
            .addField(`Memory`, `**\` ${this.formatBytes(os.totalmem() - os.freemem())} \` [${`▇`.repeat(`${memoryPercent}`[0])} ${Math.floor(memoryPercent)}%](${messageUrl}) ${`▇`.repeat(10 - `${memoryPercent}`[0])} \` ${this.formatBytes(os.totalmem())} \`**`)
            .setColor('#2f3136')
            .setTimestamp();
    }

    buttons() {
        let buttonAbout = new MessageButton()
            .setLabel('About')
            .setCustomId('about:about')
            .setStyle(this.category === 'about' ? 'SECONDARY' : 'PRIMARY')
            .setEmoji('🫖')
            .setDisabled(this.category === 'about');
        let buttonSystem = new MessageButton()
            .setLabel('System')
            .setCustomId('about:system')
            .setStyle(this.category === 'system' ? 'SECONDARY' : 'PRIMARY')
            .setEmoji('⚙️')
            .setDisabled(this.category === 'system');
        return new MessageActionRow()
            .addComponents(buttonAbout)
            .addComponents(buttonSystem);
    }

    async run(message, args) {
        this.category = message.content.slice(this.client.prefix.length).split(' ')[0];
        message.channel.send({
            embeds: [this.category === 'about' ? this.embedAbout() : await this.embedSystem(message)],
            components: [this.buttons()]
        });
    }
}