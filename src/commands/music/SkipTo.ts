/* eslint-disable radix */
/* eslint-disable max-len */
import { Client, Message } from 'discord.js';

import ICommand from '@interface/Command';
import { playSong } from '@util/music/player';
import queue from '@util/music/queue';

module.exports = {
	config: {
		name: 'SkipTo',
		category: 'Music',
		description: 'Pula todas as faixas até um número',
		admin: false,
		aliases: ['skipto', 'st']
	},
	execute: async (client: Client, message: Message, _args: string[]): Promise<boolean> => {
		const guildId = message.guild.id;
		const existDispatcher = queue.get(guildId) !== undefined ? queue.get(guildId).server.dispatcher !== null : false;

		if (queue.get(guildId) !== undefined && queue.get(guildId).messageChannel.id !== message.channel.id) {
			const tempMsg = await message.channel.send(':x: **Estou vinculado a outro canal de texto!**');
			setTimeout(async () => {
				await tempMsg.delete();
			}, 2500);

			return true;
		}

		if (!existDispatcher) {
			message.channel.send(':x: **Não está tocando nada no momento**');
			return false;
		}

		if (_args[0] === undefined) {
			message.channel.send(':x: **Por favor insira algum número**');
			return false;
		}

		if (Number.isNaN(_args[0])) {
			message.channel.send(':x: **Por favor insira um número**');
			return false;
		}

		const guildQueue = queue.get(guildId);
		guildQueue.songs = guildQueue.songs.slice(parseInt(_args[0]));

		if (guildQueue.songs.length > 0) {
			playSong(guildQueue.songs[0].link, guildQueue);
		} else {
			message.channel.send(':white_check_mark: **Fila finalizada**');
		}

		return false;
	}
} as ICommand;
