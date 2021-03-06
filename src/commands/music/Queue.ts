/* eslint-disable no-continue */
/* eslint-disable max-len */
import { Client, Message, MessageEmbed } from 'discord.js';

import config from '@config';
import ICommand from '@interface/Command';
import IQueueMusic from '@interface/music/QueueMusic';
import queue from '@util/music/queue';

module.exports = {
	config: {
		name: 'Queue',
		category: 'Music',
		description: 'Mostra a fila de faixas atual',
		admin: false,
		aliases: ['queue', 'q']
	},
	execute: async (client: Client, message: Message, _args: string[]): Promise<boolean> => {
		const guildId = message.guild.id;

		if (queue.get(guildId) !== undefined && queue.get(guildId).messageChannel.id !== message.channel.id) {
			const tempMsg = await message.channel.send(':x: **Estou vinculado a outro canal de texto!**');
			setTimeout(async () => {
				await tempMsg.delete();
			}, 2500);

			return true;
		}

		if (queue.get(guildId) === undefined) {
			message.channel.send(':zzz: **A fila está vazia**');

			return false;
		}

		const tempMessage = await message.channel.send(':clipboard: **Aguarde um momento...**');

		const guildQueue = queue.get(guildId);
		const { songs } = guildQueue;

		if (songs.length > 0) {
			const embed = new MessageEmbed()
				.setColor(config.embedColor)
				.setAuthor(`Fila de ${message.guild.name}`, message.author.avatarURL())
				.setTimestamp(new Date());

			const nowPlaying: IQueueMusic = guildQueue.server.dispatcher !== null ? guildQueue.songs[0] : { title: '-/-', link: '' };
			const looping = guildQueue.loop ? '\n\n:repeat: **A fila está em loop**' : '';

			let description = `\n\n:arrow_forward: **Tocando agora:** \n\n[${nowPlaying.title}](${nowPlaying.link}) ${looping}\n\n:arrow_down: **Próximas faixas: **\n\n`;

			const start = guildQueue.server.dispatcher !== null ? 1 : 0;
			const total = guildQueue.server.dispatcher !== null ? 11 : 10;

			for (let i = start; i < total; i += 1) {
				const song = songs[i];

				if (song === undefined) continue;
				const nDisplay = start > 0 ? i : (i + 1);

				description += `\`${nDisplay}.\` [${song.title}](${song.link}) \n`;
			}

			if (songs.length > total) {
				const amount = songs.length - total;

				description += `*E mais ${amount} faixas*`;
			}

			embed.setDescription(description);

			await tempMessage.delete();
			message.channel.send(embed);

			return false;
		}

		await tempMessage.delete();
		message.channel.send(':zzz: **A fila está vazia**');

		return false;
	}
} as ICommand;
