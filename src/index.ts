import dotenv from 'dotenv';

import {
    REST,
    Routes,
    Client,
    ActivityType,
    ChannelType,
    Collection,
    GatewayIntentBits
} from 'discord.js';

import {
    ChatCommand,
    UserContextMenuCommand,
    MessageContextMenuCommand
} from './types/Command';

import { readdirSync } from 'fs';
import path from 'path';
import { $log } from './libs/logs';

import DataBase from './libs/database';

dotenv.config();

const { ID, TOKEN, MONGO_URI } = process.env;

const DB = new DataBase(MONGO_URI);

class Bot {
    readonly applicationId: string;
    readonly applicationToken: string;
    rest: REST;
    client: Client;
    commands: Collection<string, ChatCommand>;
    userContexts: Collection<string, UserContextMenuCommand>;
    messageContexts: Collection<string, MessageContextMenuCommand>;

    constructor() {
        this.applicationId = ID;
        this.applicationToken = TOKEN;

        this.rest = new REST({ version: '10' }).setToken(this.applicationToken);

        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildIntegrations,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildVoiceStates
            ]
        });

        this.commands = new Collection();
        this.userContexts = new Collection();
        this.messageContexts = new Collection();
    }

    async registerFolderCommands(folderPath: string = 'commands') {
        let folder = path.join(__dirname, folderPath),
            files = readdirSync(folder),
            listCommands: any[] = [];

        try {
            for (let file of files) {
                if (file.includes('.map')) continue;

                const command = new (await import(path.join(folder, file))).default(this.client);
                
                if (command instanceof ChatCommand) {
                    for (let data of command.data) {
                        this.commands.set(data.name, command);

                        listCommands = [...listCommands || [], data.toJSON()];
                    }

                    continue;
                } else if (command instanceof UserContextMenuCommand) {
                    this.userContexts.set(command.data.name, command);
                } else if (command instanceof MessageContextMenuCommand) {
                    this.messageContexts.set(command.data.name, command);
                }
                
                listCommands = [...listCommands || [], command.data.toJSON()];
            }

            return listCommands;
        } catch (err) {
            $log.setOptions({ type: 'error', title: 'Register Folter Commands' }).log(err);

            return [];
        }
    }

    async registerCommands() {
        try {
            $log.setOptions({ title: 'Load Commands' }).log('Started refreshing application (/) commands.');

            await this.rest.put(Routes.applicationCommands(this.applicationId), {
                body: [
                    ...await this.registerFolderCommands(),
                    ...await this.registerFolderCommands('contexts')
                ]
            });
        
            $log.setOptions({ title: 'Load Commands' }).log('Successfully reloaded application (/) commands.');
        } catch (err) {
            $log.setOptions({ type: 'error', title: 'Register Commands' }).log(err);
        }
    }

    async registerEvents() {
        const
            folder = path.join(__dirname, 'events'),
            eventsFiles = await readdirSync(folder);

        $log.setOptions({ title: 'Load Events' }).log('Started refreshing events.');

        for (let file of eventsFiles) {
            if (file.includes('.map')) continue;

            try {
                const
                    eventName = file.split(".")[0],
                    event = new (await import(path.join(folder, file))).default(this.client);

                this.client.on(eventName, (...args) => event?.run(...args));

                delete require.cache[require.resolve(`./events/${file}`)];
            } catch (err) {
                $log.setOptions({ type: 'error', title: 'Register Events' }).log(err);
            }
        }

        $log.setOptions({ title: 'Load Events' }).log('Successfully reloaded events.');
    }

    start() {
        this.registerCommands();

        this.registerEvents();

        DB.connect();

        this.client.on('ready', () => {
            $log.setOptions({ title: 'BOT' }).log(`Logged in as ${this.client.user.tag}!`);

            this.client.user.setPresence({
                activities: [{
                    name: `${Math.floor(Math.random() * 999) - 0}`,
                    type: ActivityType.Watching
                }],
                status: 'dnd'
            });
        });

        this.client.on('interactionCreate', async interaction => {
            let category = (interaction as any).customId.split(':'),
                command = this.commands.get(category[0]);

            if (command && command.options.interactionEvents && command?.interaction) return command?.interaction(category.slice(1), interaction as any);

            // if (this[category[0]]) this[category[0]](category.slice(1), interaction);

            try {
                if (interaction.isChatInputCommand()) {
                    let command = this.commands.get(interaction.commandName);

                    await command?.execute(interaction, this.client);
                } else if (interaction.isUserContextMenuCommand()) {
                    let context = this.userContexts.get(interaction.commandName);

                    await context?.execute(interaction, this.client);
                } else if (interaction.isMessageContextMenuCommand()) {
                    let context = this.messageContexts.get(interaction.commandName);

                    await context?.execute(interaction, this.client);
                }
            } catch (err) {
                $log.setOptions({ type: 'error', title: 'Interaction Create' }).log(err);
            }
        });
          
        this.client.login(TOKEN);
    }
}

new Bot().start();