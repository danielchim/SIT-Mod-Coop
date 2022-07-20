const fs = require('fs');
const path = require('path');
const { AccountController } = require('../../../../../src/Controllers/AccountController');

class VVMatch {
	constructor() {
		this.groups = [];
		this.invites = [];
		this.matching = {};
		this.servers = {};
	}

	getAllAccounts() {
		return AccountController
			.getAllAccounts();
	}

	getServerByGroupId(groupId) {

		return vvMatcher.servers[groupId];
	}

	joinServerByGroupId(groupId, accountId) { 

		const thisServer = vvMatcher.getServerByGroupId(groupId);
		if(thisServer === undefined)
			return undefined;

		// add me
		thisServer.players[accountId] = {
			isHost: false,
			accountId: accountId,
			profileId: "pmc" + accountId,
			isPlayer: true,
			isBot: false
		};

		console.log(accountId + " has joined the Server");

    	return thisServer;
	}

	getServerIAmIn(sessionID) {
		for(let iServer in this.servers) {
			let s = this.servers[iServer];
			for(let iPlayer in s.players) {
				let p = s.players[iPlayer];
				console.log(p);
				if(p.accountId == sessionID) {
					return this.servers[iServer];
				}
			}
		}
		return undefined;
	}


	// Group Players Screen
	// Note the change here to include SessionID, make sure to add that to the response
	getGroupStatus(info, sessionID) {

    //      console.log("getGroupStatus");
    //    console.log(info);

		// get all players, filter out self and anyone not here
		let availablePlayers = 
			AccountController
			.getAllAccounts()
			.filter(x=>x._id != sessionID);
			// Turn these off when testing Server functionality
			// .filter(x=> vvMatcher.matching[x._id] !== undefined)
			// .filter(x=> vvMatcher.matching[x._id].status !== undefined)
			// .filter(x=> vvMatcher.matching[x._id].status.location == info.location)
			// .filter(x=> vvMatcher.matching[x._id].status.savage == info.savage);

			// a quick fudge for testing
		for(let p in availablePlayers) {
			//console.log(availablePlayers[p])
			availablePlayers[p].lookingGroup = true;

		}

		vvMatcher.matching[sessionID] = {};
		vvMatcher.matching[sessionID].status = info;
		vvMatcher.matching[sessionID].status.dateUpdated = Date.now();

		// Callback only requires "players" list
        return {"players": availablePlayers};
    }

	sendInvite = function(info, sessionID) {
		// console.log(sessionID);
		// console.log(JSON.stringify(info));
	
		if(vvMatcher.groups[sessionID] == undefined)
			return null;
	
		let fromAccount = AccountController
		.getAllAccounts()
		.find(x=>x._id == sessionID);

		vvMatcher.invites.push(
			{
				_id: sessionID,
				// Id: sessionID,
				groupId: sessionID,
				dt: 0,
				from: sessionID,
				to: info.uid,
				profile: fromAccount, // This is the wrong one
			}
		);
	
		// vvMatcher.groups[sessionID].players.push(
		// 	{"_id": "pmc" + info.uid, "region": "EUR", "ip": server.getIp(), "savageId": "scav" + + info.uid, "accessKeyId": ""}  
		// )
	
		return response_f.getUnclearedBody({});
	}

	groupInviteAccept(info, sessionID) {
		console.log(sessionID);
		console.log(info);

		return response_f.getBody(
			{
				Error : null,
				Value : vvMatcher.getLastInvite(sessionID)
			}
			 );
	}

	groupInviteDecline(sessionID, info) {
		console.log(sessionID);
		console.log(info);
	}

	deleteGroup(info) {
		for (let groupID in vvMatcher.groups) {
		   if (groupID === info.groupId) {
			   delete vvMatcher.groups[groupID];
			   return;
		   }
	   }
	}

	groupCreate(info, sessionID) {
		console.log("groupCreate");
		console.log(info);
		console.log(sessionID);
		vvMatcher.groups[sessionID] = {
			_id: sessionID,
			owner: sessionID,
			status: "MATCHING",
			players: []
		}

		let myAccounts = AccountController
		.getAllAccounts()
		.filter(x=>x.aid = sessionID);
		for(let index in myAccounts) {
			let acc = myAccounts[index];
			vvMatcher.groups[sessionID].players.push(acc);
		}

		return vvMatcher.groups[sessionID];
	}

	groupLeaderStartedMatch(sessionID) {
		if(vvMatcher.groups[sessionID] !== undefined) {
			vvMatcher.groups[sessionID].groupStatus = "START";
		}
	}

	groupSearchStart(sessionID, info) {
		let myAccount = AccountController.find(sessionID);
		if(myAccount.matching === undefined) myAccount.matching = {};
		myAccount.matching.lookingForGroup = true;
	}
	groupSearchStop(sessionID, info) {
		let myAccount = AccountController.find(sessionID);
		if(myAccount.matching === undefined) myAccount.matching = {};
		myAccount.matching.lookingForGroup = false;
	}

	getLastInvite(sessionID) {
		let myInvites = vvMatcher.invites.filter(x=> x.to == sessionID);
		// console.log("getLastInvite");
		// console.log(myInvites);
		if(myInvites.length > 0) {
			let lastInviteIndex = myInvites.length-1;
			// console.log("getLastInvite::lastIndex::" + lastInviteIndex);
			if(lastInviteIndex != -1) {
				let lastInvite = myInvites[lastInviteIndex];
				if(lastInvite !== undefined) {
					let fromAccount	= 
					this.getAllAccounts().find(x=>x._id == lastInvite.from);

					let toAccount = 
					this.getAllAccounts().find(x=>x._id == sessionID);

					return lastInvite;
				}
			}
		}
		return undefined;
	}

	getInvites(sessionID) {
		// console.log(sessionID);
		// console.log("invites");
		// console.log(vvMatcher.invites);

		let lastInvite = vvMatcher.getLastInvite(sessionID);
		if(lastInvite !== undefined) {
			let fromAccount	= 
			this.getAllAccounts().find(x=>x._id == lastInvite.from);

			let toAccount = 
			this.getAllAccounts().find(x=>x._id == sessionID);

			return response_f.noBody(lastInvite);
		}
		return response_f.nullResponse();

	}

}

const vvMatcher = new VVMatch();

module.exports.VVMatch = VVMatch;
module.exports.vvMatcher = new VVMatch();
