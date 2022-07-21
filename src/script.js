// include the module whose functions are to be overridden
const fs = require('fs');
const path = require('path');
const http = require('http');
// const WebSocket = require('ws'); // requires npm install ws on the Server
const net = require('net'); // natural TCP Sockets
const responseOverrides = require("./responseOverrides")
const location = require('../../../../src/classes/location');
const { vvMatcher, VVMatch } = require('./Classes/Classes');
const { logger } = require('../../../../core/util/logger');
// const wsServerIp = server.getIp();
// const wsServerPort = server.getPort() + 2;
// const netSocketServerPort = wsServerPort + 1;
const { customQuests } = require('./customQuests');
const { customItems } = require('./customItems');
const { DialogueController } = require('../../../../src/Controllers/DialogueController');
const { ResponseController } = require('../../../../src/Controllers/ResponseController');
const serverUrl = ResponseController.getBackendUrl();

function DeepCopy(obj) {
	return JSON.parse(JSON.stringify(obj));
}

exports.mod = (mod_info) => {

	// console.log(mod_info);
	// const parentDir = process.cwd() + "/" + "user/mods/VVCoop_1.0.0/"
	const modConfig = mod_info;
	const gameMode = modConfig.Mode; // Can be Coop, PvP or PvPvE
	const modFolder = __dirname + "\\..\\"; // modfolder/
	const parentDir = __dirname + "\\..\\"; // modfolder/
	const srcDir = __dirname + "\\" ; // modfolder/src/
	const dbDir = srcDir + "\\db\\"; // modfolder/src/db

    logger.logInfo(mod_info.name + ". Loading...");

	// DialogueController.AddDialogueMessage("boolyboolycuntface", 
	// {
	// 	text: "",
	// 	templateId: "boolyboolycuntface",
	// 	type: dialogue_f.getMessageTypeValue("insuranceReturn"),
	// 	maxStorageTime: 30 * 3600,
	// 	systemData: {
	// 		"date": utility.getDate(),
	// 		"time": utility.getTime(),
	// 	}
	// }
	// );
	// logger.logInfo(JSON.stringify(mod_info));
	
	// New Match Handler Class
	// let vvMatcher = new VVMatch();
	//logger.logInfo(JSON.stringify(match_f.handler));
	// initLocationAndLootOverrides();

	// initMatchOverrides();

	initResponseOverrides();

	for(let b in global._database.bots) {
		// if(global._database.bots[b].health.BodyParts.Head !== undefined) {
		// 	global._database.bots[b].health.BodyParts.Head.min = 1;
		// 	global._database.bots[b].health.BodyParts.Head.max = 1;

		// 	global._database.bots[b].health.BodyParts.Chest.min = 85;
		// 	global._database.bots[b].health.BodyParts.Chest.min = 85;
			let botExperienceFilePath = `${dbDir}/bots/${b}/experience.json`;
			if(fs.existsSync(botExperienceFilePath)) {
					fs.readFile(botExperienceFilePath, 'utf8' , (err, data) => {
						if (err) {
						console.error(err)
						return;
						}
						data = JSON.parse(data);
						// console.log(global._database.bots[b].experience);
						global._database.bots[b].experience = data;

						logger.logSuccess("[MOD] TarkovCoop; Applied " + b + " experience data");

					});
				}

			// let botDifficultyFilePath = 'user/mods/VVCoop_1.0.0/src/db/bots/' + b + '/aiconfig.json';
			// fs.exists(botDifficultyFilePath, (e) => {
			// 	if(e) {
			// 		fs.readFile(botDifficultyFilePath, 'utf8' , (err, data) => {
			// 			if (err) {
			// 			console.error(err)
			// 			return;
			// 			}
			// 			data = JSON.parse(data);
					
			// 			global._database.bots[b].difficulty.easy = data;
			// 			global._database.bots[b].difficulty.normal = data;
			// 			global._database.bots[b].difficulty.hard = data;
			// 			global._database.bots[b].difficulty.impossible = data;
				
			// 			logger.logSuccess("[MOD] TarkovCoop; Applied " + b + " ai config data");

			// 		});
			// 	}
			// });
		// }
	}

	for(let b in global._database.locations) {
		let locationBaseFilePath = 'user/mods/VVCoop_1.0.0/src/db/locations/base/' + b + '.json';
		fs.exists(locationBaseFilePath, (exists) => {
			if(exists) {
				fs.readFile(locationBaseFilePath, 'utf8' , (err, data) => {
					if (err) {
					  console.error(err)
					  return;
					}
					data = JSON.parse(data);
					global._database.locations[b].base = data;
				});
				logger.logSuccess("[MOD] TarkovCoop; Applied " + b + ".json location data");

			}
		});

		let locationLootFilePath = 'user/mods/VVCoop_1.0.0/src/db/locations/loot/' + b + '.json';
		fs.exists(locationLootFilePath, (exists) => {
			if(exists) {
				fs.readFile(locationLootFilePath, 'utf8' , (err, data) => {
					if (err) {
					  console.error(err)
					  return;
					}
					data = JSON.parse(data);
					global._database.locations[b].base = data;
				});
				logger.logSuccess("[MOD] TarkovCoop; Applied " + b + ".json loot data");

			}
		});
	}

	for(let b in global._database.items) {
		let itemBaseFilePath = 'user/mods/VVCoop_1.0.0/src/db/items/' + b + '.json';
		fs.exists(itemBaseFilePath, (exists) => {
			if(exists) {
				fs.readFile(itemBaseFilePath, 'utf8' , (err, data) => {
					if (err) {
					  console.error(err)
					  return;
					}
					data = JSON.parse(data);
					//global._database.items[b].base = data;
				});
				// logger.logSuccess("[MOD] TarkovCoop; Applied " + b + ".json items data");

			}
		});
	}

	const weatherDirectory = __dirname + "\\db\\weather";
	// console.log(weatherDirectory);
	//for(const index in global._database.weather) {
	//	console.log(index);
	let weatherIndex = 0;
		for(const fileName of fs.readdirSync(weatherDirectory)) {
			const weatherFilePath = weatherDirectory + "\\" + fileName;
			fs.readFile(weatherFilePath, 'utf8' , (err, data) => {
				if (err) {
				console.error(err)
				return;
				}
				data = JSON.parse(data);
				global._database.weather[weatherIndex] = data;
				// logger.logSuccess("[MOD] TarkovCoop; Applied " + weatherFilePath + " weather data");

			});
			weatherIndex++;
		}
	//}


customItems.LoadItems(mod_info);
	
customQuests.LoadCustomQuests(mod_info);

	// Setting up websocket
	// const webSocketServer = new WebSocket.Server({
	// 	"server": httpServer
	// });

	// webSocketServer.addListener("listening", () =>
	// {
	// 	Logger.success(`Started websocket at ${HttpServer.getWebsocketUrl()}`);
	// 	Logger.success("Server is running. Happy playing!");
	// });

	// webSocketServer.addListener("connection", HttpServer.wsOnConnection.bind(this));

	// Used to chat between Central and Web Socket
	// let clients = [
	// 	new WebSocket('ws://' + wsServerIp + ':' + wsServerPort),
	// ];

	// const sendToMatcher = function(serverGroupId, isBot, data) {
	// 	let server = vvMatcher.getServerByGroupId(serverGroupId);
	// 	if(server !== undefined) {
	// 		let personToAffect = isBot ? server.bots[data.accountId] : server.players[data.accountId];
	// 		if(personToAffect !== undefined) {
	// 			if(personToAffect.occurances === undefined) {
	// 				personToAffect.occurances = [];
	// 			}

	// 			personToAffect.occurances.push(data);
	// 		}
	// 	}
	// }
	
	// clients.map(client => {
	// 	client.on('message', msg => { 
	// 		logger.logInfo("[VVCoop] ~~~ Central Server received WS Message ~~~ ");
	// 		var outputData = {};
	// 		var str = JSON.stringify(msg.toString());
	// 		try {
	// 			outputData = JSON.parse(str);
	// 				logger.logInfo(outputData["groupId"]);
	// 				logger.logInfo(outputData.groupId);
	// 				if(outputData["groupId"] !== undefined) {
	// 				logger.logInfo(outputData);
	// 				let isBot = outputData.isBot !== undefined ? outputData.isBot : false;
	// 				sendToMatcher(outputData["groupId"], isBot, outputData);
	// 			}
	// 		} catch (error) {
	// 			logger.logInfo(error);
	// 		}
	// 	});
	// });
	  
}

