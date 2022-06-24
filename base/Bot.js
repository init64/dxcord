const
    { Client, Intents, Collection } = require('discord.js');

module.exports = class Bot {
    constructor() {
        this.bot = new Client({
            intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]
        });

        this.commands = new Collection();
        this.aliases = new Collection();

        this.db = {
            users: require('../db/users.js'),
            guilds: require('../db/guilds.js')
        }

        this.logs = new (require('./Logs.js'))(this);

        this.prefix = '>';
    }

    loadCommand(pathCommand, command) {
        try {
            let props = new (require(`${pathCommand}/${command}`))(this);
            this.commands.set(props.config.name, props);
            for (let alias of props.config.aliases)
                this.aliases.set(alias, props.config.name);
            return false;
        } catch (err) {
            console.log(`Load Command: -->`, err);
        }
    }
}