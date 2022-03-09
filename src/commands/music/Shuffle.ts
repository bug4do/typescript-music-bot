/* eslint-disable max-len */
import { Client, Message } from 'discord.js';

import ICommand from '@interface/Command';
import { playSong } from '@util/music/player';
import queue, { shuffleQueue } from '@util/music/queue';

module.exports = {
	config: {
		name: 'Shuffle',
		category: 'Music',
		description: 'Aleatoriza a fila',
		admin: false,
		aliases: ['shuffle', 'randomizar']
	},
	execute: async (client: Client, message: Message, _args: string[]): Promise<boolean> => {
		const guildId = message.guild.id;
		const existConnection = queue.get(guildId) !== undefined ? queue.get(guildId).server.connection !== null : false;

		if (queue.get(guildId) !== undefined && queue.get(guildId).messageChannel.id !== message.channel.id) {
			const tempMsg = await message.channel.send(':x: **Estou vinculado a outro canal de texto!**');
			setTimeout(async () => {
				await tempMsg.delete();
			}, 2500);

			return true;
		}

		if (!existConnection) {
			message.channel.send(':x: **Não estou conectado a nenhum canal de voz**');
			return false;
		}

		const guildQueue = queue.get(guildId);
		if (guildQueue !== undefined && guildQueue.songs.length > 0) {
			shuffleQueue(guildQueue);
			shuffleQueue(guildQueue);
			playSong(guildQueue.songs[0].link, guildQueue);

			message.channel.send(':arrows_counterclockwise: **Fila randomizada com sucesso**');

			return false;
		}

		message.channel.send(':x: **A fila está vazia**');
		return false;
	}
} as ICommand;
