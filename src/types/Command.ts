import {
    Client,
    SlashCommandBuilder,
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    type ChatInputCommandInteraction,
    type UserContextMenuCommandInteraction,
    type MessageContextMenuCommandInteraction,
    type ApplicationCommandOptionType,
    RESTPostAPIChatInputApplicationCommandsJSONBody
} from 'discord.js';

interface IDataSlashCommand {
    name: string;
    descrition: string;
}

interface IChatCommand extends RESTPostAPIChatInputApplicationCommandsJSONBody {
    aliases?: Array<IChatCommand>;
    interactionEvents?: boolean;
}

interface IContextMenuCommand {
    name: string;
}

export class ChatCommand {
    data: Array<IChatCommand> = [];
    options: IChatCommand;

    constructor(commandOptions: IChatCommand) {
        this.data = [...this.data || [], commandOptions, ...commandOptions?.aliases || []];

        this.options = commandOptions;
    }

    async interaction(args: Array<string>, interaction: any): Promise<any> {
        return;
    }

    async execute(interaction: ChatInputCommandInteraction, client: Client): Promise<any> {
        return;
    }
}

export class UserContextMenuCommand {
    data: ContextMenuCommandBuilder;

    constructor(commandOptions: IContextMenuCommand) {
        this.data = new ContextMenuCommandBuilder()
            .setName(commandOptions.name)
            .setType(ApplicationCommandType.User);
    }

    async execute(interaction: UserContextMenuCommandInteraction, client: Client) : Promise<any> {
        return;
    }
}

export class MessageContextMenuCommand {
    data: ContextMenuCommandBuilder;

    constructor(commandOptions: IContextMenuCommand) {
        this.data = new ContextMenuCommandBuilder()
            .setName(commandOptions.name)
            .setType(ApplicationCommandType.Message);
    }

    async execute(interaction: MessageContextMenuCommandInteraction, client: Client) : Promise<any> {
        return;
    }
}