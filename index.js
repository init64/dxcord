require('dotenv').config();

const
    fs = require('fs'),
    mongoose = require('mongoose'),
    client = new (require('./base/Bot.js'))();

const init = async () => {

    // ? Load all commands
    const dirCommands = await fs.readdirSync('./commands/');
    for (let dir of dirCommands) {
        try {
            let dirCategory = await fs.readdirSync(`./commands/${dir}/`);
            for (let command of dirCategory.filter(cmd => !cmd.split('.').includes('.off.') && cmd.split('.').pop('.js'))) {
                client.loadCommand(`../commands/${dir}`, command);
            }
        } catch (err) {
            console.log('Command', err);
        }
    }

    // ? Load all events
    const eventsFiles = await fs.readdirSync(`./events/`);
	for (let file of eventsFiles) {
        try {
            let eventName = file.split(".")[0],
                event = new (require(`./events/${file}`))(client);
            client.bot.on(eventName, (...args) => event.run(...args));
            delete require.cache[require.resolve(`./events/${file}`)];
        } catch (err) {
            console.log('Event:', err);
        }
    }

    if (process.env.TOKEN) client.bot.login(process.env.TOKEN);
        else console.log(`No token bot found`);

    // ? Connect DataBase
    mongoose.connect(`mongodb://localhost/${process.env.MONGO_URI || 'dxcord'}`, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(db => console.log(`DataBase: connected \x1b[4m\x1b[36m${db.connections[0].name}\x1b[0m`))
        .catch(err => console.log(`Error: \n`, err));
}

init();