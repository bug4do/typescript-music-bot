import { Guild, Message } from 'discord.js';

import IQueue from '@interface/music/Queue';

const queue: Map<string, IQueue> = new Map();

function initQueue(guildId: string, guild: Guild): IQueue {
	const currentQueue: IQueue = {
		server: {
			connection: null,
			dispatcher: null
		},
		songs: [],
		guild,
		loop: false,
		messageChannel: null
	};

	queue.set(guildId, currentQueue);

	return currentQueue;
}

function initQueueWithMessage(guildId: string, message: Message): IQueue {
	const guildQueue = initQueue(guildId, message.guild);

	guildQueue.messageChannel = message.channel;

	return guildQueue;
}

export default queue;
export { initQueue, initQueueWithMessage };
