module.exports = class Command {
	constructor(client, {
		name = null,
        description = '',
        emoji = null,
		dirname = false,
		aliases = new Array(),
		botPermissions = new Array(),
		memberPermissions = new Array(),
		nsfw = false,
        clear = true,
        hide = false
	}) {
        this.config = { name, description, emoji, dirname, aliases, botPermissions, memberPermissions, nsfw, clear, hide }
    }
}