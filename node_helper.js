'use strict';
const NodeHelper = require('node_helper');
var mysql = require('mysql');
const exec = require('child_process').exec;


module.exports = NodeHelper.create({

	setup: function () {
		this.con = mysql.createConnection({
  			host: "localhost",
  			user: "smartmirror",
  			password: "Sm4rtM1rr0r"
		});
		this.con.connect(function(err) {
 			if (err) throw err;
  			console.log("Connected to mysql!");
			
	//		con.query("select * from mydb.user;" , function (err, result, fields) {
	//		//con.query("select * from mydb.user;", function (err, result, fields) {
   // 			if (err) throw err;
    //			console.log(result[1].name);
 	//		});
		});	
	},



	// Subclass socketNotificationReceived received.
	socketNotificationReceived: function(notification, payload) {
		const self = this;
		if(notification === 'CONFIG') {
			this.config = payload
      		this.setup(); 
    	}else if (notification === 'save_user_view') {
			//console.log(payload)

			var tmp_id = payload["id"]
			//console.log(tmp_id)

			for (const [key, value] of Object.entries(payload)) {
				if(key === "id")
					continue;
				this.con.query("UPDATE mydb.login_view SET " + key + " = " + value + " where user_ID = " + tmp_id, function (err, result, fields) {
					if (err) throw err;
					//self.sendSocketNotification('LOGGIN_USER_INFOS',JSON.stringify(result));
					//console.log(JSON.stringify(result));
				});
			}
			
		}else if(notification === 'LOGGIN_USER') {
			this.con.query("select * from mydb.user, mydb.login_view where ID = " + payload + " AND ID = user_ID", function (err, result, fields) {
				if (err) throw err;
				self.sendSocketNotification('LOGGIN_USER_INFOS',JSON.stringify(result));
				//console.log(JSON.stringify(result));
			});
    	}else if(notification === 'GREET_USER') {
			this.con.query("select " + payload[0] + " from mydb.greetings", function (err, result, fields) {
				var min=0; 
    			var max=result.length -1;  
    			var random =Math.floor(Math.random() * (+max - +min)) + +min;

				
				var greeting =(result[random][payload[0]]).replace("USER",payload[1]);
				//console.log("Greet with: " + greeting);
				self.sendSocketNotification('GREET_USER_RESULT',[payload[0],greeting]);

			});
		// } else if (notification === 'MENU_SELECTED' && payload === 'bivital') {
		// 	const shell_command = 'echo "hello command"';
		// 	console.log('execute shell command:', shell_command);
		// 	// exec(shell_command);
		// 	console.log(exec(shell_command));
		} else if (notification === 'EXECUTE_COMMAND') {
			// self.sendSocketNotification("SHOW_ALERT", {type: "notification", message: "Starting BIVital game HELPER"});
			var shell_command = payload;
			// console.info("execute shell command: " + shell_command);
			// console.info("execute shell command: " + payload);
			// console.log('execute shell command:', shell_command);
			// exec(shell_command);
			// console.log(exec(shell_command));
			console.log('######################################');
			exec("bash echo HELLO", (error, stdout, stderr) => {
				if (error) {
					console.error(`exec error: ${error}`)
					return;
				}
			});
		}
  	}
});
