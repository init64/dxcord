module.exports = class Ready {
	constructor (client) {
		this.client = client;

        this.activities = [
            { name: '>help', type: 'WATCHING' },
            { name: 'genkan.xyz', type: 'PLAYING', status: 'idle' },
            { name: 'dsx.ninja', type: 'COMPETING', status: 'dnd' }
        ]
	}

	async run() {
        /*
            ? COMPETING LISTENING PLAYING STREAMING WATCHING
            * online dnd idle offline
        */
        setInterval(() => {
            let { name, type, status } = this.activities[Math.floor(Math.random() * this.activities.length)];
            this.client.bot.user.setPresence({
                activities: [{ name, type }],
                status: status || 'online'
            });
        }, 10000);
	}
}