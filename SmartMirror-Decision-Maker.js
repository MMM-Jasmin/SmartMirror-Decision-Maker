/**
 * @file smartmirror-decision-maker.js
 *
 * @author nkucza
 * @license MIT
 *
 * @see  https://github.com/NKucza/smartmirror-decision-maker
 */


 Module.register("SmartMirror-Decision-Maker", {

	numberOfRecognisedPersons: 0,
	currentuserid: -1,
	currentpersonTrackID : -1,

	flatRightDetected : false,

	timeOFLastGreet: 0,
	timebetweenGreets: 50000,

	UserLoginView: undefined,

	mainMenuShowLastTime: {timestamp: undefined},
	mainMenuHideLastTime: {timestamp: undefined},
	mainHideAllModulesLastTime: {timestamp: undefined},
	mainAdjModulesLastTime: {timestamp: undefined},
	EmoLastTime: {timestamp: undefined},
	Debug_infos: {},


//----------------------------------------------------------------------//
// CONFIG DEFAULTS
//----------------------------------------------------------------------//
	defaults: {
		module_dict: {
			"clock": ["clock", "uhr"],
			"calendar": ["calendar"],
			"SmartMirror-nlu-display": ["speech"],
			"MMM-cryptocurrency": ["crypto"],
			"weatherforecast": ["wforecast"],
			"currentweather": ["weather", "wetter"],
			"weather": ["weather", "wetter"],
			"MMM-RAIN-MAP" : ["rain_map"],
			"newsfeed": ["newsfeed", "news feed"],
			"MMM-SimpleLogo": ["logo", "legato-logo"],
			"MMM-PublicTransportHafas": ["transportation"],
			"MMM-TomTomTraffic": ["traffic"],
			"smartmirror-bivital": ["bivital"],
			"MMM-SoccerLiveScore": ["soccer"],
			"MMM-News": ["news"],
			"MMM-Canteen": ["mensa"],
			"SmartMirror-Mensa-Plan": ["mensa"],
			"MMM-Fuel": ["fuel", "gas"],
			"MMM-XKCD": ["comic"],
			"MMM-Comics": ["comic"],
			"MMM-Liquipedia-Dota2": ["dota2", "esports"],
			"MMM-ITCH-IO": ["games"],
			"smartmirror-coffeebot": ["coffee", "coffeebot"],
			"SmartMirror-Decision-Maker": ["Decision_maker"],
			"MMM-iFrame": ["office_temp"],
		},
		allways_visible_modules: [
			"SmartMirror-Webserver-ImageView",
			"SmartMirror-Label-Display"
		],
		inital_websocket_view: "NONE"
	},
//----------------------------------------------------------------------//
// START FUNKTION
//----------------------------------------------------------------------//
	start: function() {
		var self = this;
		self.currentuserid = -1;
		console.log(self.name + " has started...");
		self.sendSocketNotification('CONFIG', self.config);

		self.Debug_infos['user logged in'] = "nobody";
		self.Debug_infos['camera [FPS]'] = -1;
		self.Debug_infos['remove bg [FPS]'] = -1;
		self.Debug_infos['websocket [FPS]'] = -1;
		self.Debug_infos['face recognition [FPS]'] = -1;
		self.Debug_infos['object recognition [FPS]'] = -1;
		self.Debug_infos['gesture recognition [FPS]'] = -1;
		self.Debug_infos['center display [FPS]'] = -1;
		//self.Debug_infos['avg recognition [FPS]'] = -1;
		self.Debug_infos["total power consumption [Watt]"] = -1;

		//self.Debug_infos['max detection FPS'] = self.config.maxDetFPS;
		//config.language = "de";
		//Translator.loadCoreTranslations(config.language);
	},

	getRandomFloat: function (min, max, decimals) {
		const str = (Math.random() * (max - min) + min).toFixed(decimals);
		return parseFloat(str);
	  },

//----------------------------------------------------------------------//
// NOTIFICATION HANDLER
//----------------------------------------------------------------------//
	notificationReceived: function(notification, payload, sender) {
		var self = this;

		// Debug infos can allways be installed
		switch (notification) {
			case 'CENTER_DISPLAY_FPS':
				self.Debug_infos['center display [FPS]'] = parseFloat(payload).toFixed(2).toString();
				self.updateDom();
				break;
			case '/camera_left/fps' :
				var json_obj = JSON.parse(payload);
				self.Debug_infos['camera [FPS]'] = parseFloat(json_obj["FPS"]).toFixed(2).toString();
				self.updateDom();
				break;
			case '/camera_right/fps' :
				var json_obj = JSON.parse(payload);
				self.Debug_infos['camera [FPS]'] = parseFloat(json_obj["FPS"]).toFixed(2).toString();
				self.updateDom();
				break;
			case '/camera_top/fps' :
				var json_obj = JSON.parse(payload);
				self.Debug_infos['camera [FPS]'] = parseFloat(json_obj["FPS"]).toFixed(2).toString();
				self.updateDom();
				break;
			case '/background/fps':
				var json_obj = JSON.parse(payload);
				self.Debug_infos['remove bg [FPS]'] = parseFloat(json_obj["FPS"]).toFixed(2).toString();
				self.updateDom();
				break;
			case '/websocket/fps':
				var json_obj = JSON.parse(payload);
				self.Debug_infos['websocket [FPS]'] = parseFloat(json_obj["FPS"]).toFixed(2).toString();
				self.updateDom();
				break;
			case '/face_det/fps':
				var json_obj = JSON.parse(payload);
				self.Debug_infos['face recognition [FPS]'] = parseFloat(json_obj["FPS"]).toFixed(2).toString();
				self.updateDom();
				break;
			case '/object_det/fps':
				var json_obj = JSON.parse(payload);
				self.Debug_infos['object recognition [FPS]'] = parseFloat(json_obj["OBJECT_DET_FPS"]).toFixed(2).toString();
				self.updateDom();
				break;
			case '/gesture_det/fps':
				var json_obj = JSON.parse(payload);
				self.Debug_infos['gesture recognition [FPS]'] = parseFloat(json_obj["GESTURE_DET_FPS"]).toFixed(2).toString();
				self.updateDom();
				break;
			case '/gesture_det/hailo8/avg_power':
					self.Debug_infos['hailo8 gesture [Watt]'] = parseFloat(payload).toFixed(2).toString();
					total_power = 0.0;
					if (typeof self.Debug_infos['hailo8 object [Watt]'] !== 'undefined') {
						total_power += parseFloat(self.Debug_infos['hailo8 object [Watt]']);
					}
					if (typeof self.Debug_infos['hailo8 gesture [Watt]'] !== 'undefined') {
						total_power += parseFloat(self.Debug_infos['hailo8 gesture [Watt]']);
					}
					if (typeof self.Debug_infos["Jetson power consumption [Watt]"] !== 'undefined') {
						total_power += parseFloat(self.Debug_infos["Jetson power consumption [Watt]"]);
					}
					self.Debug_infos["total power consumption [Watt]"] = total_power.toFixed(2).toString();
						self.updateDom();
						break;
			case '/object_det/hailo8/avg_power':
				self.Debug_infos['hailo8 object [Watt]'] = parseFloat(payload).toFixed(2).toString();
				total_power = 0.0;
				if (typeof self.Debug_infos['hailo8 object [Watt]'] !== 'undefined') {
					total_power += parseFloat(self.Debug_infos['hailo8 object [Watt]']);
				}
				if (typeof self.Debug_infos['hailo8 gesture [Watt]'] !== 'undefined') {
					total_power += parseFloat(self.Debug_infos['hailo8 gesture [Watt]']);
				}
				if (typeof self.Debug_infos["Jetson power consumption [Watt]"] !== 'undefined') {
					total_power += parseFloat(self.Debug_infos["Jetson power consumption [Watt]"]);
				}
				self.Debug_infos["total power consumption [Watt]"] = total_power.toFixed(2).toString();
					self.updateDom();
					break;
			case 'TEGRASTATS' :
				self.Debug_infos["Jetson power consumption [Watt]"] = parseFloat(payload["WATT"]).toFixed(2).toString() ;
				//self.Debug_infos["other power consumption [Watt]"] = this.getRandomFloat(9.5,10.5,2).toFixed(2).toString();
				total_power = 0.0;
				if (typeof self.Debug_infos['hailo8 object [Watt]'] !== 'undefined') {
					total_power += parseFloat(self.Debug_infos['hailo8 object [Watt]']);
				}
				if (typeof self.Debug_infos['hailo8 gesture [Watt]'] !== 'undefined') {
					total_power += parseFloat(self.Debug_infos['hailo8 gesture [Watt]']);
				}
				if (typeof self.Debug_infos["Jetson power consumption [Watt]"] !== 'undefined') {
					total_power += parseFloat(self.Debug_infos["Jetson power consumption [Watt]"]);
				}
				self.Debug_infos["total power consumption [Watt]"] = total_power.toFixed(2).toString();
				self.updateDom();
				break;
			default:
				
				//self.updateDom();
		}

		//no control if a selfie is made!
		//just return and ignor all changes
		// all control messages
		switch (notification) {
			case 'MENU_SELECTED':
				console.info("[" + self.name + "] " + "Menu item was selected: " + payload);
				self.process_menu_selection(payload)
				break;
			case 'RECOGNIZED_PERSONS':
				self.process_rec_person(payload.RECOGNIZED_PERSONS);
				break;
			case 'ALL_MODULES_STARTED':
				self.sendSocketNotification('LOGGIN_USER', -1);
				self.sendNotification('smartmirror-TTS-en',"Welcome to the smart mirror!");
				break;
			case 'DOM_OBJECTS_CREATED':
				MM.getModules().enumerate(function(module) {
					if (module.name != "MMM-TomTomTraffic" && !self.config.allways_visible_modules.includes(module.name)) {
						module.hide(0, function() { Log.log('Module is hidden.');}, {lockString: "lockString"});
					}
				});
				break;
			case '/speech/nlu':
		
				nlu_json = (JSON.parse(payload))
				intent_name = nlu_json["intent"]["intentName"]

				self.process_voice_commands(intent_name);
				break;
		}
		return;
	},

//----------------------------------------------------------------------//
// SOCKET NOTIFICATION HANDLER
//----------------------------------------------------------------------//
	socketNotificationReceived: function(notification, payload) {
		var self = this;
		if(notification === 'LOGGIN_USER_INFOS') {
			//console.log("[" + self.name + "] " + "User data received: " + JSON.stringify(JSON.parse(payload)[0]["language"]));	
			//console.log("test " + JSON.parse(payload)[0])

			self.UserLoginView = (JSON.parse(payload))[0]
			
			self.adjustViewLogin(self.UserLoginView);
			self.Debug_infos['user logged in'] = JSON.parse(payload)[0]["name"];
			self.updateDom();			

			if (JSON.parse(payload)[0]["ID"] > 0) {
				//self.sendNotification('smartmirror-TTS-en',"Hello, nice to see you");
				var d = new Date();
				if((d.getTime() - self.timeOFLastGreet > self.timebetweenGreets)){
					self.sendSocketNotification("GREET_USER",[JSON.parse(payload)[0]["language"],JSON.parse(payload)[0]["name"]])
					self.timeOFLastGreet = d.getTime();   
				}
			} else if (JSON.parse(payload)[0]["ID"] == -1) {
				//if nodody is in front of the mirror close everything
				//menu closed..
				// self.sendNotification('MAIN_MENU', 'menu');
				//center display closed..
				self.sendNotification('LABEL_DISPLAY', 'HIDEALL');
				self.sendNotification('MAIN_MENU' , 'reset');
				self.sendNotification('/websocket/sel', self.config.inital_websocket_view);
			}
		} else if (notification === 'GREET_USER_RESULT'){
			if (payload[0] == "de")
				self.sendNotification('smartmirror-TTS-ger',payload[1]);
			else if (payload[0] == "en")
				self.sendNotification('smartmirror-TTS-en',payload[1]);

			self.sendNotification("SHOW_ALERT", {type: "notification", message: payload[1]});
		}
	},

//----------------------------------------------------------------------//
// PROCESS VOICE COMMANDS
//----------------------------------------------------------------------//
	process_voice_commands: function(intent_name){
		var self = this;
		if (intent_name === "remove_all"){
			self.hide_all_modules();
			this.sendNotification("/led/action/flash", [0.0, 0.0, 0.0, 0.0]);
		} 
		else if (intent_name === "reset_view"){
			self.adjustViewLogin(self.UserLoginView);
			this.sendNotification("/led/action/flash", [255.0, 255.0, 255.0, 0.0]);
		} else {
			this.sendNotification("/led/action/flash", [255.0, 200.0, 0.0, 0.0]);
			for (const [key, value] of Object.entries(self.config.module_dict)){		
			value.forEach(function(word) {
				if (intent_name.includes(word)){
					MM.getModules().withClass(key).enumerate(function(module) {
						module.show(1000, function() {Log.log(module.name + ' is shown.');}, {lockString: "lockString"});
					});
				}
			});
			}
		}
	},
//----------------------------------------------------------------------//
// VIEW ADJUSTMENT FOR NEW USER
//----------------------------------------------------------------------//
	adjustViewLogin: function(user_config){
		var self = this;

		self.sendNotification('USER_MODULE_VISIBILITY_CONFIG', user_config)


		for (const [name, value] of Object.entries(self.config.module_dict)){
			for(var key in user_config){
				if(value.includes(key)){
					MM.getModules().withClass(name).enumerate(function(module) {
					if(user_config[key]) {
						if (module.hidden){
							module.show(1000, function() {Log.log(module.name + ' is shown.');}, {lockString: "lockString"});
						}
					}else{
						 if (!module.hidden){
							module.hide(1000, function() {Log.log(module.name + ' is hidden.');}, {lockString: "lockString"})
						}
					}					
					});
				}
			}
		}
	},

//----------------------------------------------------------------------//
// PROCESS RECEIVED PERSON JASON
// must decide who is logged in
//----------------------------------------------------------------------//
	process_rec_person: function(persons){
		var self = this;
		// example:  {"1": {"TrackID": 522, "face": {"confidence": 0.9970833725349748, "w_h": [0.1037, 0.09167], "TrackID": 282, "center": [0.52222, 0.59375], "ID": 4, "name": "Nils"}, "w_h": [0.375, 0.40625], "name": "person", "center": [0.4963, 0.72083]}}
		//console.log("[" + self.name + "] process_rec_person triggered " +  JSON.stringify(persons));

		if (self.numberOfRecognisedPersons != Object.keys(persons).length){

			self.numberOfRecognisedPersons = Object.keys(persons).length
			
			if(self.numberOfRecognisedPersons == 0){
				if(self.currentuserid != -1){
					self.sendSocketNotification('LOGGIN_USER', -1);
				}
			}
		}

		var idToLoginNow = -1;
		if (Object.keys(persons).length != 0){
			//console.log("test "+ self.currentpersonTrackID + "        " + JSON.stringify(persons))
			if (persons.hasOwnProperty(self.currentpersonTrackID)){
				//console.log(persons[self.currentpersonTrackID])
				if (persons[self.currentpersonTrackID].hasOwnProperty('face'))
					if(persons[self.currentpersonTrackID].face.confidence > 0.3){
						idToLoginNow = persons[self.currentpersonTrackID].face.ID
					} else {
						idToLoginNow = 0;
					}
				if (persons[self.currentpersonTrackID].hasOwnProperty('gestures')) {
					self.process_gestures_object(persons[self.currentpersonTrackID].gestures);
					//console.log("[" + self.name + "] ceck gestures");
				} else {
					self.process_gestures_object([]);
				}
			}

			if (idToLoginNow < 1) {
				for(var key in persons)
					if (persons[key].hasOwnProperty('face')){
						if(persons[key].face.confidence > 0.3){
							idToLoginNow = persons[key].face.ID;
						}else{
							idToLoginNow = 0;
						}			
						self.currentpersonTrackID = key; //persons["TrackID"];
						//self.Debug_infos['currentpersonTrackID'] = self.currentpersonTrackID;
						//self.updateDom();
						if (idToLoginNow > 0) {
							break;
						}
					}
			}
		} 

		if (idToLoginNow == -1){
			self.currentpersonTrackID = -1; //persons["TrackID"];
			//self.Debug_infos['currentpersonTrackID'] = -1;
			//self.updateDom();
			self.process_gestures_object([]);
		}

		if (idToLoginNow != self.currentuserid){
			self.sendSocketNotification('LOGGIN_USER', idToLoginNow);
			self.currentuserid = idToLoginNow;
			console.log("[" + self.name + "] changing current user to: " + idToLoginNow );
			self.sendNotification('USER_LOGIN', idToLoginNow);
		}
	},

//----------------------------------------------------------------------//
// PROCESS MENU SELECTION
//----------------------------------------------------------------------//
	process_menu_selection: function(selection) {
		var self = this;

		if (selection == "saveView") {
			var tmp = {id: self.currentuserid};

			MM.getModules().enumerate(function(module) {
				var tmp_mname = module.name
				var tmp_keys = self.config.module_dict[tmp_mname]

				if(tmp_keys && tmp_keys.length !== 0){
					tmp[tmp_keys[0]] = !module.hidden
					self.UserLoginView[tmp_keys[0]] = !module.hidden
				}
			});
			
			self.sendNotification("SHOW_ALERT", {type: "notification", message: "saving current view as loggin view"});
					
			self.sendSocketNotification('save_user_view', tmp);

		} else if (selection == "bivital") {
			// self.sendNotification("SHOW_ALERT", {type: "notification", message: "Starting BIVital game"});
			console.info("[" + self.name + "] " + "Starting BIVital game");
			// console.info(exec('xeyes'));
			self.sendSocketNotification('EXECUTE_COMMAND', {type: "noticifation", message: "HELLO"});
		} else {
			for (const [key, value] of Object.entries(self.config.module_dict)){		
				value.forEach(function(word) {
					if (selection.includes(word)){
						MM.getModules().withClass(key).enumerate(function(module) {
							if (module.hidden) module.show(1000, function() {Log.log(module.name + ' is shown.');}, {lockString: "lockString"});
							else module.hide(1000, function() {Log.log(module.name + ' is hidden.');}, {lockString: "lockString"});
						});
					}
				});
			}
		}
	},

//----------------------------------------------------------------------//
// PROCESS GESTURES OF LOGGED IN USER ONLY
//----------------------------------------------------------------------//
	process_gestures_object: function(gestures_list){
		var self = this;

		self.flatRightDetected = false;

		var d = new Date();

		gestures_list.forEach(function (item) {
			switch (item["name"]){
				case "right_flat":
					self.flatRightDetected = true;
					MM.getModules().withClass("SmartMirror-Main-Menu-Tiles").enumerate(function(module) {
						if (module.hidden && self.check_for_validity(self.mainMenuShowLastTime, 0.2, 1.4)){
							module.show(1000, function() {Log.log(module.name + ' is shown.');}, {lockString: "lockString"});
						} else if(!module.hidden) {
							var cursorPosX = item["center"][0];
							var cursorPosY = item["center"][1];
							var cursorDistance = item["distance"];
							module.updateCursor(cursorPosX, cursorPosY, cursorDistance);
						}
					});
					break;
				case "right_tumbs_up":
					self.sendNotification('LABEL_DISPLAY', 'SHOWALL');
					break;
				case "right_tumbs_down":
					self.sendNotification('LABEL_DISPLAY', 'HIDEALL');
					break;
				case "left_tumbs_up":
					self.sendNotification("/websocket/sel", "full");
					break;
				case "left_tumbs_down":
					self.sendNotification("/websocket/sel", self.config.inital_websocket_view);
					break;
				case "left_one":
					if(self.check_for_validity(self.EmoLastTime, 1, 5))
						self.sendNotification('LABEL_DISPLAY', 'EMO');
					break;
				case "left_fist":
					if(self.check_for_validity(self.mainAdjModulesLastTime, 2, 3))
						self.adjustViewLogin(self.UserLoginView);
					break;
				case "right_fist":
					if(self.check_for_validity(self.mainHideAllModulesLastTime, 2, 3))
						self.hide_all_modules();
					break;
				case "left_one":
					break;
				case "right_one":
					break;
			}
		});

		if((self.flatRightDetected == false)){ //&& (self.MainMenuSelectedLast != -1)
			MM.getModules().withClass("SmartMirror-Main-Menu-Tiles").enumerate(function(module) {
				if(!module.hidden && self.check_for_validity(self.mainMenuHideLastTime, 2, 2.5)){
					module.hide(1000, function() {Log.log(module.name + ' is hidden.');}, {lockString: "lockString"});
				}
			});
			
		}
	},

	hide_all_modules: function() {
		var self = this;
		MM.getModules().enumerate(function(module) {
			if (!self.config.allways_visible_modules.includes(module.name)) {
				module.hide(0, function() { Log.log('Module is hidden.');}, {lockString: "lockString"});
			}
		});
	},

//----------------------------------------------------------------------//
// this function checks if a certain gesture has been performed over a period of time. timeMemory has to be property of SmartMirror-Decision-Maker class
// usage if(check_for_validity(this.newsNextLastTime, 2, 3))
//----------------------------------------------------------------------//
	check_for_validity: function(timeMemory, minTime = 2, maxTime = 3){
		const d = new Date()
		if(timeMemory.timestamp === undefined){
			timeMemory.timestamp = d
		}else {
			var diffSeconds = (d - timeMemory.timestamp) / 1000
			if(diffSeconds > minTime && diffSeconds < maxTime){
				timeMemory.timestamp = undefined
				return true
			} else if (diffSeconds > maxTime){
				timeMemory.timestamp = d
			}
		}
		return false
	},

//----------------------------------------------------------------------//
// CREATE DOM
// shows debug information in the this.Debug_infos[key] dictionary
//----------------------------------------------------------------------//
	getDom() {
		var self = this;
		self.data.header = 'Debug Informations'

		var myTableDiv = document.createElement("DebugTable");
		myTableDiv.className = "DebugTablexsmall";
		
  		var table = document.createElement('TABLE');
  		//table.border = '1';
		table.className = "DebugTablexsmall";

		var tableBody = document.createElement('TBODY');
		table.appendChild(tableBody);
		
		for (var key in self.Debug_infos) {
			var tr = document.createElement('TR');
			//tr.className = "DebugTablexsmall";
			tableBody.appendChild(tr);		
			var td = document.createElement('TD');
			td.appendChild(document.createTextNode(key));
			//td.className = "DebugTablexsmall";
			//td.width = '70px';
			tr.appendChild(td);
			var td = document.createElement('TD');
			//td.width = '50';
			td.appendChild(document.createTextNode(self.Debug_infos[key]));
			td.width = '70px';
			tr.appendChild(td);
		} 

		myTableDiv.appendChild(table);
		return myTableDiv;
	},

	getStyles: function(){
		return ["SmartMirror-Decision-Maker.css"];
	}
});
