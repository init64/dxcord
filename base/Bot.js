const
    { Client, Intents, Collection } = require('discord.js');
const { emit } = require('../db/users.js');

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

        this.prefix = process.env.PREFIX || '>';
    }

    getTime(s) {
        let d = Math.floor(s / 86400);
            s -= d * 86400;
        let h = Math.floor(s / 3600);
            s -= h * 3600;
        let m = Math.floor(s / 60);
            s -= m * 60;
        return (d > 0 ? `${d}d ` : '') + (h > 0 ? `${h}h ` : '') + (m > 0 ? `${m}m ` : '') + `${s}s`;
    }

    uts(UT, one, two, five) {
        if (`${UT}`.split('').reverse()[1] === '1') return `${UT}${five}`;
        if (`${UT}`.split('').reverse()[0] === '1') return `${UT}${one}`;
        if (+(`${UT}`.split('').reverse()[0]) >= 2 && +(`${UT}`.split('').reverse()[0]) <= 4) return `${UT}${two}`;
        return `${UT}${five}`;
    }

    timeago(time = Date.now()) {
        let msPerMinute = 60 * 1000,
            msPerHour = msPerMinute * 60,
            msPerDay = msPerHour * 24,
            elapsed = Date.now() - time;
        
        if (elapsed < msPerMinute) return `${this.uts(Math.round(elapsed / 1000), ' second', ' seconds', ' seconds')} ago`;
        else if (elapsed < msPerHour) return `${this.uts(Math.round(elapsed / msPerMinute), ' minute', ' minutes', ' minutes')} ago`;
        else if (elapsed < msPerDay) return `${this.uts(Math.round(elapsed / msPerHour), ' hour', ' hours', ' hours')} ago`;
        else {
            let { day, month_name, year } = this.unix(time);
            return `${day} ${month_name} ${year}`;
        }
    }

    unix(unix = Date.now()) {
        const Months_name = [ "january", "february", "martha", "april", "may", "june", "july", "august", "september", "october", "november", "december" ];
    
        let date = new Date(unix),
            year = date.getFullYear(),
            day = date.getDate(),
            month = date.getMonth(),
            hours = date.getHours(),
            minutes = date.getMinutes(),
            seconds = date.getSeconds();
    
        if (month < 10) month = `0${ month }`;
        if (day < 10) day = `0${ day }`;
        if (hours < 10) hours = `0${ hours }`;
        if (hours >= 24) hours = `0${ hours - new Number(24) }`;
        if (minutes < 10) minutes = `0${ minutes }`;
        if (minutes >= 60) minutes = `0${ minutes - new Number(60) }`;
        if (seconds < 10) seconds = `0${ seconds }`;
        if (seconds >= 60) seconds = `0${ seconds - new Number(60) }`;
    
    
        return {
            year,
            day,
            month,
            month_name: Months_name[Number(month)],
            hours,
            minutes,
            seconds
        }
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