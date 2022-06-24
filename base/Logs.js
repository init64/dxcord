const { MessageEmbed } = require('discord.js');

module.exports = class Logs {
    constructor(client) {
        this.client = client;

        this.red = '#f64072';
        this.green = '#00d38f';
    }

    async voice(type, member, oldChannel, newChannel) {
        let embed = new MessageEmbed().setTimestamp(),
            guildId = member.guild.id,
            guild = await this.client.db.guilds.findOne({ guildId }),
            logChannelId = guild?.config?.logs?.channelId;

        if (!logChannelId) return;

        switch(type) {
            case "join":
                embed
                    .setAuthor({ iconURL: member.displayAvatarURL(), name: `${member.user.tag} [${member.nickname}]` })
                    .setDescription(`**<@${member.id}> joined voice channel <#${oldChannel.id}>**`)
                    .setColor(this.green);
                break;
            case "switch":
                embed
                    .setAuthor({ iconURL: member.displayAvatarURL(), name: `${member.user.tag} [${member.nickname}]` })
                    .setDescription(`**<@${member.id}> switched voice channel <#${oldChannel.id}> ⟶ <#${newChannel.id}>**`)
                    .setColor(this.green);
                break;
            case "leave":
                embed
                    .setAuthor({ iconURL: member.displayAvatarURL(), name: `${member.user.tag} [${member.nickname}]` })
                    .setDescription(`**<@${member.id}> left voice channel <#${oldChannel.id}>**`)
                    .setColor(this.red);
                break;
        }

        this.client.bot.guilds.cache.find(({ id }) => id === guildId).channels.cache.find(({ id }) => id === logChannelId).send({ embeds: [embed] })
    }
}