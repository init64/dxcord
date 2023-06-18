import {
    Client,
    SlashCommandBuilder,
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    type ChatInputCommandInteraction,
    type UserContextMenuCommandInteraction,
    type MessageContextMenuCommandInteraction
} from 'discord.js';

interface IChatCommand {
    name: string;
    description: string;
    aliases?: Array<IChatCommand>;
    NSFW?: boolean;
    interactionEvents?: boolean;
}

interface IContextMenuCommand {
    name: string;
}

export class ChatCommand {
    data: Array<SlashCommandBuilder> = [];
    options: IChatCommand;

    constructor(commandOptions: IChatCommand) {
        for (let command of [commandOptions, ...commandOptions?.aliases || []]) {
            const cmd = new SlashCommandBuilder()
                .setName(command.name)
                .setDescription(command.description)
                .setNSFW(command.NSFW || false);

            this.data = [...this.data || [], cmd];
        }

        this.options = commandOptions;
    }

    async interaction(args: Array<string>, interaction: ChatInputCommandInteraction): Promise<any> {
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