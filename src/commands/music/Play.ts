/* eslint-disable max-len */
import { Client, Message, MessageEmbed } from 'discord.js';
import { validateURL } from 'ytdl-core';

import ICommand from '@interface/Command';
import { addedPlaylistToQueueEmbed, addedToQueueEmbed } from '@util/music/chat/embeds';
import { playSong, startPlaying } from '@util/music/player';
import queue, { initQueueWithMessage } from '@util/music/queue';
import { connect } from '@util/music/voice';
import { addVideosIfPlaylist } from '@util/music/youtube/playlist';
import { getPlaylistInfo, getVideoInfo, isPlaylistURL, searchVideo } from '@util/music/youtube/youtube';

module.exports = {
	config: {
		name: 'Play',
		category: 'Music',
		description: 'Toca/Adiciona um link a fila (Suporta pesquisa e playlists)',
		admin: false,
		aliases: ['play', 'tocar', 'p']
	},
	execute: async (client: Client, message: Message, _args: string[]): Promise<boolean> => {
		const guildId = message.guild.id;
		const { channel } = message.member.voice;
		const existConnection = queue.get(guildId) !== undefined ? queue.get(guildId).server.connection !== null : false;

		if (queue.get(guildId) !== undefined && queue.get(guildId).messageChannel.id !== message.channel.id) {
			const tempMsg = await message.channel.send(':x: **Estou vinculado a outro canal de texto!**');
			setTimeout(async () => {
				if (tempMsg !== null || tempMsg !== undefined) await tempMsg.delete();
			}, 2500);

			return true;
		}

		if (!existConnection && channel === null) {
			message.channel.send(':microphone2: **Você precisa estar em um canal de voz**');
			return false;
		}

		const guildQueue = queue.get(guildId) !== undefined ? queue.get(guildId) : initQueueWithMessage(guildId, message);
		if (await connect(guildQueue, channel)) {
			message.channel.send(`:loud_sound: **Conectado ao canal de voz:** \`${channel.name}\``);
		}

		const joinedArgs = _args.join(' ');

		if (guildQueue.songs.length > 0 && joinedArgs.replace(' ', '').length === 0) {
			playSong(guildQueue.songs[0].link, guildQueue);

			message.channel.send(':cd: **Retomando a fila**.');
			return false;
		}

		if (joinedArgs.length <= 3) {
			message.channel.send(':x: **Por favor informe uma palavra maior para pesquisa**');
			return false;
		}

		const tempMessage = await message.channel.send(':mag: **Realizando pesquisa...**');

		const isValidLink = validateURL(joinedArgs) || isPlaylistURL(joinedArgs);
		let url = isValidLink ? joinedArgs : '';

		if (!isValidLink) {
			const search = await searchVideo(joinedArgs);
			if (search.length === 0) {
				await tempMessage.delete();

				message.channel.send(':construction: **Não foi possível encontrar nenhum resultado**');
				return false;
			}

			url = search[0].url;
		}

		guildQueue.requestedBy = message.member;

		if (guildQueue.songs.length === 0) {
			startPlaying(url, guildQueue);
			await tempMessage.delete();

			return false;
		}

		const isPlaylist = isPlaylistURL(url);
		let messageToSend: MessageEmbed;

		const avatar = message.member.user.avatarURL();
		if (isPlaylist) {
			const playlistAmount = await addVideosIfPlaylist(url, guildQueue);
			const playlistInfo = await getPlaylistInfo(url);

			messageToSend = addedPlaylistToQueueEmbed(playlistAmount, guildQueue.songs.length, url, playlistInfo.title, playlistInfo.firstUrl, avatar);
		} else {
			const videoInfo = await getVideoInfo(url);

			guildQueue.songs.push({ link: url, title: videoInfo.videoDetails.title });

			messageToSend = addedToQueueEmbed(guildQueue.songs.length, url, videoInfo, avatar);
		}

		await tempMessage.delete();
		message.channel.send(messageToSend);

		return true;
	}
} as ICommand;
