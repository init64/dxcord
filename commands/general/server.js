const
    Command = require('../../base/Command.js'),
    { MessageEmbed } = require('discord.js');

module.exports = class Help extends Command {
    constructor(client) {
        super(client, {
            name: 'server',
            description: 'Get information about the server.',
            dirname: __dirname,
            emoji: '✨',
            aliases: ['serv', 'guild'],
            nsfw: false
        });

        this.client = client;

        this.NO = ' ᠌';
    }

    async run(message, args) {
        let members = message.guild.members.cache,
            contentFilter = {
                ALL_MEMBERS: `Scan media content from all members`
            },
            getChannel = type => message.guild.channels.cache.filter(channel => channel.type === type).size,
            server = new MessageEmbed()
            .setAuthor({
                name: message.guild.name,
                iconURL: message.guild.iconURL()
            })
            .setTitle('Server information')
            .setDescription(`**Members:** \` ${members.filter(member => member?.presence?.status !== 'offline').size} \` online out of \` ${members.size} \`\n**Description:** ${message.guild.description}`)
            .addField(`Owner`, `<@${message.guild.ownerId}>`, true)
            .addField(`Create At`, this.client.timeago(message.guild.createdAt), true)
            .addField(`Joined At`, this.client.timeago(message.guild.joinedAt), true)
            .addField(`Verification Level`, `${message.guild.verificationLevel}`, true)
            .addField(`Server Booster Count`, `${message.guild.premiumSubscriptionCount}`, true)
            .addField(`Server Boost Level`, `${message.guild.premiumTier === 'NONE' ? 0 : message.guild.premiumTier.split('_')[1]}`, true)
            .addField(`Explicit Media Content Filter`, contentFilter[message.guild.explicitContentFilter], true)
            .addField(`Primary Language`, `${message.guild.preferredLocale}`, true)
            .addField(`NSFW Level`, `${message.guild.nsfwLevel}`, true)
            .addField(`Roles`, `${message.guild.roles.cache.size}`, true)
            .addField(`Emojis`, `${message.guild.emojis.cache.size}`, true)
            .addField(this.NO, this.NO, true)
            .addField(`Channels`, `Categories: **\` ${getChannel('GUILD_CATEGORY')} \`**\nText: **\` ${getChannel('GUILD_TEXT')} \`**`, true)
            .addField(this.NO, `Voice: **\` ${getChannel('GUILD_VOICE')} \`**\nNews: **\` ${getChannel('GUILD_NEWS')} \`**`, true)
            .addField(this.NO, `Threads: **\` ${getChannel('GUILD_PUBLIC_THREAD')} \`**\nStage voice: **\` ${getChannel('GUILD_STAGE_VOICE')} \`**`, true)
            .setColor('#2f3136')
            .setThumbnail(message.guild.bannerURL())
            .setTimestamp();
        message.channel.send({ embeds: [server] });
    }
}