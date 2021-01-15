'use strict';

const fs = require('fs');

let rawdata = fs.readFileSync('data.json');
let botData = JSON.parse(rawdata);

const Discord = require('discord.js');
const client = new Discord.Client();

client.once('ready', () => {
	console.log('Ready!');
});

let bot = {
  users: [],
  games: botData.games,
}

function getMessage(title, description, fullUsername = null, avatarUrl = null) {
	let result;
	if (fullUsername !== null || fullUsername !== null) {
		result = new Discord.MessageEmbed()
			.setColor('#A716E0')
			.setTitle(title)
			.setAuthor(fullUsername, avatarUrl)
			.setDescription(description)
	} else {
		result = new Discord.MessageEmbed()
			.setColor('#A716E0')
			.setTitle(title)
			.setDescription(description)
	}
	return result;
}

function gameSelectionMessage() {
  let result = '';
  for (let gameID in bot.games) {
    result = `${result}**${botData['command-prefix'] + (Number(gameID) + 1)}** - ${bot.games[gameID]}\n`;
  }
  return result;
}

function addUserData(id, fullUsername, status) {
  bot.users.push({
			id: id,
      fullUsername: fullUsername,
      status: status,
  });
}

function userCheck(fullUsername) {
  for (let userID in bot.users) {
    let user = bot.users[userID].fullUsername;
    if (user ===  fullUsername) {
      return true;
    }
  }
  return false;
}

function getUserObject(fullUsername) {
  for (let userID in bot.users) {
    let user = bot.users[userID].fullUsername;
    if (user ===  fullUsername) {
      return bot.users[userID];
    }
  }
  return null;
}

function searchTeammate(fullUsername, game) {
	for (let userID in bot.users) {
		if (bot.users[userID].fullUsername !== fullUsername && bot.users[userID].game === game) {
			return bot.users[userID]
		}
	}
	return null;
}

function deleteUser(fullUsername) {
	for (let userID in bot.users) {
		if (bot.users[userID].fullUsername === fullUsername) {
			bot.users.splice(userID, 1);
		}
	}
	return undefined;
}

function getUsersInSearch() {
	let result = 0;
	for (let userID in bot.users) {
		if (bot.users[userID].status === "search") {
			result++;
		}
	}
	return result;
}

function getUsersInSearchFull() {
	let result = {};
	for (let gameID in bot.games) {
		result[bot.games[gameID]] = 0;
	}
	for (let userID in bot.users) {
		if (bot.users[userID].status !== "search") {
			continue;
		}
		result[bot.users[userID].game]++;
	}
	return result;
}

function getStringSearchFull() {
	let result = '';
	let searchObject = getUsersInSearchFull();
	for (let nameGame in searchObject) {
		result += `${nameGame}: **${searchObject[nameGame]}**\n`;
	}
	return result + `\nВсего человек в поиске: **${getUsersInSearch()}**`;
}

client.on('message', message => {
  let user = message.author;
  let fullUsername = `${user.username}#${user.discriminator}`;

  function сheckSelectedGame(fullUsername, gameNumber, avatarUrl) {
    for (let gameID in bot.games) {
      if (gameNumber === botData['command-prefix'] + ( Number(gameID) + 1 ) && userCheck(fullUsername) === true) {
        let userObject = getUserObject(fullUsername);
        userObject.game = bot.games[gameID];

				if (userObject.status === 'game-selection') {
					userObject.status = "search";
					message.channel.send( getMessage(`Ты выбрал игру: ${userObject.game}`, `Ожидай, я уже ищу кого-нибудь для тебя.\nВсего человек в поиске: **${getUsersInSearch()}**`, fullUsername, avatarUrl) )
					.catch(error => {
						console.log('Невозможно отправить сообщение в канал.');
					});
				} else {
					message.channel.send( getMessage(`Ты изменил игру на: ${userObject.game}`, `Ожидай, я уже ищу кого-нибудь для тебя.\nВсего человек в поиске: **${getUsersInSearch()}**`, fullUsername, avatarUrl) )
					.catch(error => {
						console.log('Невозможно отправить сообщение в канал.');
					});
				}

				let teammate = searchTeammate(fullUsername, userObject.game);
				if (teammate !== null) {
					client.users.cache.get(message.author.id).send( getMessage('Смотри кого я тебе нашла:', `Ник в discord: **${teammate.fullUsername}**\nИгра: **${teammate.game}**\nДобавь скорее его в друзья!`) )
					.catch(error => {
						console.log(`Невозможно отправить сообщение пользователю: ${teammate.fullUsername}`);
					});
					client.users.cache.get(teammate.id).send( getMessage('Смотри кого я тебе нашла:', `Ник в discord: **${userObject.fullUsername}**\nИгра: **${userObject.game}**\nДобавь скорее его в друзья!`) )
					.catch(error => {
						console.log(`Невозможно отправить сообщение пользователю: ${userObject.fullUsername}`);
					});
					deleteUser(teammate.fullUsername);
					deleteUser(userObject.fullUsername);
				}
      }
    }
  }

	if (userCheck(fullUsername)) {
		let userObject = getUserObject(fullUsername);

		if (userObject.status === 'report') {
			client.users.cache.get(botData['admin-id']).send( getMessage('Баг репорт', `пользователь: **${fullUsername}**\n\n**Сообщение:**\n${message.content}`) )
			.catch(error => {
				console.log(`Невозможно отправить сообщение пользователю: ${fullUsername}`);
			});
			message.channel.send( getMessage("Сообщение отправлено", "Спасибо что помогаешь сделать бота лучше.", fullUsername, user.displayAvatarURL() ))
			.catch(error => {
				console.log('Невозможно отправить сообщение в канал.');
			});
			deleteUser(fullUsername);
			return;
		}
	}

	switch (message.content) {
    case `${botData['command-prefix']}help`:
      message.channel.send( getMessage("Информация о боте", `Здравствуй, меня зовут Aika. Я бот, который поможет тебе найти товарища по команде.\n\n**Список команад:**\n **${botData['command-prefix']}start** - Запускает поиск.\n**${botData['command-prefix']}list** - Показывает количество человек находящихся в поиске.\n**${botData['command-prefix']}report** - Позволяет отправить сообщение об ошибке.`, fullUsername, user.displayAvatarURL() ))
			.catch(error => {
				console.log('Невозможно отправить сообщение в канал.');
			});
			break;
    case `${botData['command-prefix']}start`:
      if ( !userCheck(fullUsername) ) {
        addUserData(user.id, fullUsername, 'game-selection');
      }
			message.channel.send( getMessage("Выберите игру в которую собираешься играть:", gameSelectionMessage(), fullUsername, user.displayAvatarURL()) )
			.catch(error => {
				console.log('Невозможно отправить сообщение в канал.');
			});
      break;
    case `${botData['command-prefix']}users`:
      console.log(bot.users);
      break;
		case `${botData['command-prefix']}report`:
			if (userCheck(fullUsername) !== true ) {
				addUserData(user.id, fullUsername, 'report');
			} else {
				let userObject = getUserObject(fullUsername);
				userObject.status = 'report';
			}
			message.channel.send( getMessage("Введи сообщение:", "Отправленное вам сообщение будет доставлено разработчику данного бота.", fullUsername, user.displayAvatarURL() ))
			.catch(error => {
				console.log('Невозможно отправить сообщение в канал.');
			});
			break;
		case `${botData['command-prefix']}list`:
			message.channel.send( getMessage("Статистика по поиску", getStringSearchFull(), fullUsername, user.displayAvatarURL() ));
			break;
  }

  сheckSelectedGame(fullUsername, message.content, user.displayAvatarURL());
});

client.login(botData.token);
