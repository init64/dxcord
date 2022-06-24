const
    Command = require('../../base/Command.js'),
    { MessageEmbed } = require('discord.js');

module.exports = class Code extends Command {
    constructor(client) {
        super(client, {
            name: 'code',
            description: '*&$)(#@*%(*@#&*%)(&@#($*_)@!$(@)%$*#@%',
            dirname: __dirname,
            emoji: '✨',
            aliases: ['eval', '>'],
            memberPermissions: ['dev'],
            hide: true
        });

        this.client = client;
    }

    async run(message, args) {
        let code = args.join(' ');
        try {
            eval(code);
        } catch (err) {
            console.log(err);
            message.channel.send('```\n' + err + '\n```');
        }
    }
}