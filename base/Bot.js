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

    getTime(s) {
        let d = Math.floor(s / 86400);
            s -= d * 86400;
        let h = Math.floor(s / 3600);
            s -= h * 3600;
        let m = Math.floor(s / 60);
            s -= m * 60;
        return (d > 0 ? `${d}d ` : '') + (h > 0 ? `${h}h ` : '') + (m > 0 ? `${m}m ` : '') + `${s}s`;
    };

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