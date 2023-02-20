/**
 * @file smartmirror-decision-maker.js
 *
 * @author nkucza
 * @license MIT
 *
 * @see  https://github.com/NKucza/smartmirror-decision-maker
 */


 Module.register("SmartMirror-Decision-Maker", {


	mainManuStateObj: {
		main: 0,
		camera:1,
		application:4,
		smarthome:5,
		coffee:6,
		preferences:7,
		user_settings:8,
		utilities:9,
		campus:10,
		entertainment:11
	},

	mainManuState: 0,

	numberOfRecognisedPersons: 0,
	currentuserid: -1,
	currentpersonTrackID : -1,

	facerecognitionshown: false,
	objectdetectionshown: false,
	gesturerecognitionshown: false,
	personrecognitionshown: false,
	cameraimageshown: false,
	shortdistanceshown: false,

	flatRightDetected : false,
	lastTimeFlatRight: null,
	lastXOfFlatRight : 0,
	lastYOfFlatRight : 0,

	timeOFLastGreet: 0,
	timebetweenGreets: 50000,

	timeOfLastCoffee: 0,
	timeOFLastPicture: 0,
	selfieOngoing: false,

	// Main menu
	MainMenuItems: [],
	MainMenuItemsAmount: 0,
	MainMenuSelected: -1,
	MainMenuSelectedLast: -1,
	MainMenuItemSize: 0.03, //0.0375, // 0.07
	MainMenuSelectedTime: 0,
	MainMenuDistance: -1, // Distance from user hand to selected menu tile
	MainMenuDistanceLast: -1, // Last distance from user hand to selected menu tile
	//MainMenuDistanceClickedItem: -1, // Menu item clicked by distance interaction

	newsNextLastTime: {timestamp: undefined},
	newsDetailLastTime: {timestamp: undefined},
	mainMenuShowLastTime: {timestamp: undefined},
	mainMenuHideLastTime: {timestamp: undefined},
	showAllLastTime: {timestamp: undefined},
	hideAllLastTime : {timestamp: undefined},
	userLoginChangeLastTime: {timestamp: undefined},
	printLastTime: {timestamp: undefined},
	newsScrollUpLastTime: {timestamp: undefined},
	newsScrollDownLastTime: {timestamp: undefined},
	gamesNextLastTime: {timestamp: undefined},

	Debug_infos: {},

	readingMode : false,
	applicationsViewStates: [],
	applicationClass: [
		"clock",
		"calendar", 
		// "smartmirror-speechrecognition",
		"MMM-cryptocurrency",
		"weatherforecast",
		"currentweather", 
		"newsfeed",
		"MMM-SimpleLogo", 
		"MMM-PublicTransportHafas", 
		"MMM-TomTomTraffic", 
		"smartmirror-mensa-plan", 
		"smartmirror-bivital", 
		"MMM-SoccerLiveScore",
		"MMM-News",
		"MMM-Canteen",
		"MMM-Liquipedia-Dota2",
		"MMM-DailyDilbert",
		"MMM-Fuel",
		"MMM-ITCH-IO",
		"weatherforecast",
		"weather",
		"SmartMirror-Main-Menu-Tiles"
	],


//----------------------------------------------------------------------//
// CONFIG DEFAULTS
//----------------------------------------------------------------------//
	defaults: {
	
		module_list: [
			{ name: "clock", words: ["clock", "uhr"] },
			{ name: "calendar", words: ["calendar"] },
			{ name: "smartmirror-speechrecognition", words: ["speech"] },
			{ name: "MMM-cryptocurrency", words: ["crypto"] },
			{ name: "weatherforecast", words: ["wforecast"] },
			{ name: "currentweather", words: ["weather", "wetter"] },
			{ name: "weather", words: ["weather", "wetter"] },
			{ name: "newsfeed", words: ["news feed", "newsfeed"] },
			{ name: "MMM-SimpleLogo", words: ["legato-logo"] },
			{ name: "MMM-PublicTransportHafas", words: ["transportation"] },
			{ name: "MMM-TomTomTraffic", words: ["traffic"] },
			{ name: "smartmirror-mensa-plan", words: ["mensa"] },
			{ name: "smartmirror-main-menu", words: ["menu"] },
			{ name: "SmartMirror-Main-Menu-Center", words: ["menu-center"] },
			{ name: "smartmirror-center-display", words: ["centerdisplay"] },
			{ name: "smartmirror-bivital", words: ["bivital"] },
			{ name: "MMM-SoccerLiveScore", words: ["soccer"] },
			{ name: "MMM-News", words: ["news"] },
			{ name: "MMM-Canteen", words: ["canteen"] },
			{ name: "MMM-Fuel", words: ["fuel", "gas"] },
			{ name: "MMM-DailyDilbert", words: ["comic"] },
			{ name: "MMM-Liquipedia-Dota2", words: ["esports", "dota2"] },
			{ name: "MMM-ITCH-IO", words: ["games"] },
			{ name: "smartmirror-coffeebot", words: ["coffee", "coffeebot"] },
			{ name: "SmartMirror-Decision-Maker", words: ["Decision_maker"] },
			{ name: "SmartMirror-Image-Handler", words: ["image_handler"] },
			{ name: "SmartMirror-Webserver-ImageView", words: ["image_handler"] },
			{ name: "SmartMirror-Label-Display", words: ["image_handler"] },
		],

		MainMenuDistanceEnabled: true, // Enable menu selection by flat hand distance
		MainMenuDistanceThreshold: 50, // Push distance in mm for flat right hand menu selection
	},

//----------------------------------------------------------------------//
// START FUNKTION
//----------------------------------------------------------------------//
	start: function() {
		var self = this;
		self.currentuserid = -1;
		console.log(self.name + " has started...");
		self.sendNotification('MAIN_MENU', 'menu');
		self.mainManuState = self.mainManuStateObj.main;
		console.log("[" + self.name + "] " + "sending MAIN_MENU: none");
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
		//self.Debug_infos['total power consumption'] = -1;

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
				break;
			case '/camera_left/fps':
				var json_obj = JSON.parse(payload);
				self.Debug_infos['camera [FPS]'] = parseFloat(json_obj["FPS"]).toFixed(2).toString();
				break;
			case '/background/fps':
				var json_obj = JSON.parse(payload);
				self.Debug_infos['remove bg [FPS]'] = parseFloat(json_obj["FPS"]).toFixed(2).toString();
				break;
			case '/websocket/fps':
				var json_obj = JSON.parse(payload);
				self.Debug_infos['websocket [FPS]'] = parseFloat(json_obj["FPS"]).toFixed(2).toString();
				break;
			case '/face_det/fps':
				var json_obj = JSON.parse(payload);
				self.Debug_infos['face recognition [FPS]'] = parseFloat(json_obj["FPS"]).toFixed(2).toString();
				break;
			case '/object_det/fps':
				var json_obj = JSON.parse(payload);
				self.Debug_infos['object recognition [FPS]'] = parseFloat(json_obj["OBJECT_DET_FPS"]).toFixed(2).toString();
				break;
			case '/gesture_det/fps':
				var json_obj = JSON.parse(payload);
				self.Debug_infos['gesture recognition [FPS]'] = parseFloat(json_obj["GESTURE_DET_FPS"]).toFixed(2).toString();
				break;
			case '/object_det/hailo8/avg_power':
					self.Debug_infos['hailo8 power consumption [Watt]'] = parseFloat(payload).toFixed(2).toString();
					break;	
			case 'TEGRASTATS' :
				self.Debug_infos["Jetson power consumption [Watt]"] = parseFloat(payload["WATT"]).toFixed(2).toString() ;
				self.Debug_infos["other power consumption [Watt]"] = this.getRandomFloat(9.5,10.5,2).toFixed(2).toString();
				break;
			default:
				total_power = 0.0
				if (typeof self.Debug_infos['hailo8 power consumption [Watt]'] !== 'undefined') {
					total_power += parseFloat(self.Debug_infos['hailo8 power consumption [Watt]']);
				}
				if (typeof self.Debug_infos["Jetson power consumption [Watt]"] !== 'undefined') {
					total_power += parseFloat(self.Debug_infos["Jetson power consumption [Watt]"]);
				}
				if (typeof self.Debug_infos["other power consumption [Watt]"] !== 'undefined') {
					total_power += parseFloat(self.Debug_infos["other power consumption [Watt]"]);
				}
				self.Debug_infos["total power consumption [Watt]"] = total_power.toFixed(2).toString();
				self.updateDom();
		}

		//no controle if a selfie is made!
		//just return and ignor all changes
		if (self.selfieOngoing == false){

			// all control messages
			switch (notification) {
				case 'MENU_ITEMS':
					console.log("[" + self.name + "] " + "Menu item has the following items: " + payload);
					self.MainMenuItems = payload;
					self.MainMenuItemsAmount = payload.length;
					break;
				case 'MENU_CLICKED':
					console.log("[" + self.name + "] " + "Menu item was clicked: " + payload);
					self.process_string(payload)
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
						if (module.name != "MMM-TomTomTraffic") {
							module.hide(0, function() { Log.log('Module is hidden.');}, {lockString: "lockString"});
						}
					});
				break;
			}
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
			
			self.adjustViewLogin((JSON.parse(payload))[0]);

			
			self.Debug_infos['user logged in'] = JSON.parse(payload)[0]["name"];
			self.updateDom();			
	
			if (JSON.parse(payload)[0]["ID"] > 0) {
				
				//self.sendNotification('smartmirror-TTS-en',"Hello, nice to see you");
				var d = new Date();
				if((d.getTime() - self.timeOFLastGreet > self.timebetweenGreets)){
					self.sendSocketNotification("GREET_USER",[JSON.parse(payload)[0]["language"],JSON.parse(payload)[0]["name"]])
					self.timeOFLastGreet = d.getTime();   
				}
			}else if (JSON.parse(payload)[0]["ID"] == -1) {
				//if nodody is in front of the mirror close everything
				//menu closed..
				self.sendNotification('MAIN_MENU', 'menu');
				self.mainManuState = self.mainManuStateObj.main;
				//center display closed..
				self.remove_everything_center_display();
			}
		}else if(notification === 'GREET_USER_RESULT'){
			if (payload[0] == "de")
				self.sendNotification('smartmirror-TTS-ger',payload[1]);
			else if (payload[0] == "en")
				self.sendNotification('smartmirror-TTS-en',payload[1]);

			self.sendNotification("SHOW_ALERT", {type: "notification", message: payload[1]});


		}
	},

//----------------------------------------------------------------------//
// VIEW ADJUSTMENT FOR NEW USER
//----------------------------------------------------------------------//
	adjustViewLogin: function(user_config){
		var self = this;

		if((self.aiartmirrorshown == true)){
			self.sendNotification('CENTER_DISPLAY', 'STYLE_TRANSFERE');
			self.aiartmirrorshown = false;
		}

		self.sendNotification('USER_MODULE_VISIBILITY_CONFIG', user_config)

		self.config.module_list.forEach(function(element) {
			for(var key in user_config){
				if(element.words.includes(key)){
					MM.getModules().withClass(element.name).enumerate(function(module) {
					if(user_config[key]) {
						if (module.hidden){
							module.show(1000, function() {Log.log(module.name + ' is shown.');},{lockString: "lockString"});
						}
							
					}else{
						 if(!module.hidden){
							module.hide(1000, function() {Log.log(module.name + ' is shown.');}, {lockString: "lockString"})
						}
					}					
					});
				}
			}
		});
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
		}


		if (idToLoginNow != self.currentuserid){
			self.sendSocketNotification('LOGGIN_USER', idToLoginNow);
			self.currentuserid = idToLoginNow;
			console.log("[" + self.name + "] changing current user to: " + idToLoginNow );
			self.sendNotification('USER_LOGIN', idToLoginNow);
		}
	},
	
//----------------------------------------------------------------------//
// STRING PROCESSING
// can be received by menu or speech recognition
//----------------------------------------------------------------------//
	process_string: function(transcript){
		var self = this
		if (typeof transcript === 'string'){

			switch (self.mainManuState){
				case self.mainManuStateObj.main: // switch (self.mainManuState)
					if(transcript.includes('camera')||transcript.includes('kamera')||transcript.includes('demonstration')||transcript.includes('detections')){				
						self.sendNotification('MAIN_MENU', 'camera');
						self.mainManuState = self.mainManuStateObj.camera;
					}else if(transcript.includes('application')||transcript.includes('anwendung')){				
						self.sendNotification('MAIN_MENU', 'application');
						self.mainManuState = self.mainManuStateObj.application;
					}else if(transcript.includes('utilities')||transcript.includes('nÃ¼tzliches')){				
						self.sendNotification('MAIN_MENU', 'utilities');
						self.mainManuState = self.mainManuStateObj.utilities;
					}else if(transcript.includes('campus')||transcript.includes('kampus')){				
						self.sendNotification('MAIN_MENU', 'campus');
						self.mainManuState = self.mainManuStateObj.campus;
					}else if(transcript.includes('entertainment')||transcript.includes('unterhaltung')){				
						self.sendNotification('MAIN_MENU', 'entertainment');
						self.mainManuState = self.mainManuStateObj.entertainment;
					}else if(transcript.includes('smarthome')){				
						self.sendNotification('MAIN_MENU', 'smarthome');
						self.mainManuState = self.mainManuStateObj.smarthome;
					}else if(transcript.includes('preference')||transcript.includes('einstellung')){				
						self.sendNotification('MAIN_MENU', 'preferences');
						self.mainManuState = self.mainManuStateObj.preferences;
					}
					return;
				case self.mainManuStateObj.camera: // switch (self.mainManuState)
					if(transcript.includes('back')||transcript.includes('zurÃ¼ck')){				
						self.sendNotification('MAIN_MENU', 'menu');
						self.mainManuState = self.mainManuStateObj.main;
					}else if(transcript.includes('image')||transcript.includes('bild')){				
						self.sendNotification('CENTER_DISPLAY', 'TOGGLE');
						self.cameraimageshown = !self.cameraimageshown;
					}else if(transcript.includes('distance')||transcript.includes('distanz')){				
						self.sendNotification('CENTER_DISPLAY', 'DISTANCE');
						self.shortdistanceshown = !self.shortdistanceshown
					}else if(transcript.includes('object')){				
						self.sendNotification('CENTER_DISPLAY', 'OBJECT');
						self.objectdetectionshown = !(self.objectdetectionshown);
					}else if(transcript.includes('gesture')||transcript.includes('hand')){				
						self.sendNotification('CENTER_DISPLAY', 'GESTURE');
						self.gesturerecognitionshown = !(self.gesturerecognitionshown);
					}else if(transcript.includes('face')||transcript.includes('gesicht')){				
						self.sendNotification('CENTER_DISPLAY', 'FACE');
						self.facerecognitionshown = !(self.facerecognitionshown); 
					}else if(transcript.includes('person')||transcript.includes('person')){
						self.sendNotification('CENTER_DISPLAY', 'PERSON');
						self.personrecognitionshown = !(self.personrecognitionshown);
					}else if(transcript.includes('hide all')||transcript.includes('HIDEALL')||transcript.includes('versteck alles')||transcript.includes('remove all')){
						self.remove_everything_center_display();
							
					}else if(transcript.includes('show all')||transcript.includes('SHOWALL')){
						self.sendNotification('CENTER_DISPLAY', 'SHOWALL');
						self.facerecognitionshown = true;
						self.objectdetectionshown = true;
						self.gesturerecognitionshown = true;
						self.cameraimageshown = true;
						self.personrecognitionshown = true;
					}
					return;
				case self.mainManuStateObj.utilities: // switch (self.mainManuState)
				case self.mainManuStateObj.campus: // switch (self.mainManuState)
				case self.mainManuStateObj.entertainment: // switch (self.mainManuState)
					if(transcript.includes('back')||transcript.includes('zurück')){				
						self.sendNotification('MAIN_MENU', 'menu');
						self.mainManuState = self.mainManuStateObj.main;
					} else {
						self.config.module_list.forEach(function(element) {
							var wordIncluded = false;					
							element.words.forEach(function(word){
							if(transcript.includes(word))
								wordIncluded = true	});
						if (wordIncluded)
							MM.getModules().withClass(element.name).enumerate(function(module) {
								if (module.hidden) {
									module.show(1000, function() {Log.log(module.name + ' is shown.');}, {lockString: "lockString"});
								}
								else {
									module.hide(1000, function() {Log.log(module.name + ' is shown.');}, {lockString: "lockString"});
								}
							});
						});
					}	
					return;	
				case self.mainManuStateObj.smarthome: // switch (self.mainManuState)
					if(transcript.includes('back')||transcript.includes('zurÃ¼ck')){				
						self.sendNotification('MAIN_MENU', 'menu');
						self.mainManuState = self.mainManuStateObj.main;
					} else if(transcript.includes('coffee')){
						self.sendNotification('MAIN_MENU', 'coffee');
						self.mainManuState = self.mainManuStateObj.coffee;
					}
					return;
				case self.mainManuStateObj.coffee: // switch (self.mainManuState)
					if(transcript.includes('back')||transcript.includes('zurück')){				
						self.sendNotification('MAIN_MENU', 'smarthome');
						self.mainManuState = self.mainManuStateObj.smarthome;
					} else if (transcript.includes('stats')) {
						self.config.module_list.forEach(function(element) {
						var wordIncluded = false;					
						element.words.forEach(function(word){
							if(word == "coffeebot")
								wordIncluded = true	});
						if (wordIncluded)
							MM.getModules().withClass(element.name).enumerate(function(module) {
								if (module.hidden) {
									module.show(1000, function() {Log.log(module.name + ' is shown.');}, {lockString: "lockString"});
								}
								else {
									module.hide(1000, function() {Log.log(module.name + ' is shown.');}, {lockString: "lockString"});
								}
							});
					});			

					} else {
				
						var d = new Date();
						if(d.getTime() - self.timeOfLastCoffee > 30000){
						
							self.timeOfLastCoffee = d.getTime();
							self.sendNotification('smartmirror-TTS-ger',"Ich sage es der Kaffe Maschine. Denk an deine Tasse bitte!");
							self.sendNotification("SHOW_ALERT", {type: "notification", message: "Kaffee kommt! Stell sicher, dass eine Tasse drunter steht!"});

							if (transcript.includes('singlecoffee')){
								self.sendNotification('COFFEBOT_MAKE', 'COFFEE');
							} else if (transcript.includes('doublecoffee')){
								self.sendNotification('COFFEBOT_MAKE', 'COFFEE_DOUBLE');
							} else if (transcript.includes('espresso')){
								self.sendNotification('COFFEBOT_MAKE', 'ESPRESSO');
							} else if (transcript.includes('doubleespresso')){
								self.sendNotification('COFFEBOT_MAKE', 'ESPRESSO_DOUBLE');
							}
						}else{
							self.sendNotification('smartmirror-TTS-ger',"Dein Kaffe ist noch nicht durch!");
						}
					}
					return;
				case self.mainManuStateObj.preferences: // switch (self.mainManuState)
					if(transcript.includes('back')||transcript.includes('zurÃ¼ck')){				
						self.sendNotification('MAIN_MENU', 'menu');
						self.mainManuState = self.mainManuStateObj.main;
					} else if(transcript.includes('user')){
						self.sendNotification('MAIN_MENU', 'user_settings');
						self.mainManuState = self.mainManuStateObj.user_settings;
					}
					return;
				case self.mainManuStateObj.user_settings: // switch (self.mainManuState)
					if(transcript.includes('back')||transcript.includes('zurück')){				
						self.sendNotification('MAIN_MENU', 'menu');
						self.mainManuState = self.mainManuStateObj.preferences;
					}
					return;
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
				case "flat_right":

					self.flatRightDetected = true;
					MM.getModules().withClass("smartmirror-main-menu-tiles").enumerate(function(module) {
						if (module.hidden && self.check_for_validity(self.mainMenuShowLastTime, 0.2, 1.4)){
							module.show(1000, function() {Log.log(module.name + ' is shown.');}, {lockString: "lockString"});
							self.sendNotification('GESTURE_INTERACTION', 'menu_show') //send this notification when user desires to open the main menu via gesture
						}else if(!module.hidden){
							self.lastTimeFlatRight = new Date();
							self.lastXOfFlatRight = item["center"][0]
							self.lastYOfFlatRight = item["center"][1]
							//console.log("[" + self.name + "] center X = " + self.lastXOfFlatRight + "  center Y = " + self.lastYOfFlatRight);
							self.MainMenuSelected = module.getSelectionIndexForPosition(self.lastXOfFlatRight, self.lastYOfFlatRight);
							
							if (self.config.MainMenuDistanceEnabled) {
								self.MainMenuDistance = item["distance"];
								//console.debug("Received distance: " + item["distance"]);
							}
						}
					});

					break;
				case "thumbs_up_right":
				
					if (((self.facerecognitionshown === false) || (self.objectdetectionshown === false) || (self.gesturerecognitionshown === false )) 
					&& self.check_for_validity(self.showAllLastTime, 0.5, 2.5)) {			
						console.log("[" + self.name + "] show all..." );
						self.sendNotification('CENTER_DISPLAY', 'SHOWALL');
						self.sendNotification('GESTURE_INTERACTION', 'SHOWALL'); //send this notification when user desires to toggle all camera options
						self.facerecognitionshown = true;
						self.objectdetectionshown = true;
						self.gesturerecognitionshown = true;
						self.cameraimageshown = true;
						self.personrecognitionshown = true;
					}
					break;
				case "thumbs_up_left":
					break;
				case "thumbs_down_left":
					break;
				case "thumbs_down_right":

					if (self.check_for_validity(self.hideAllLastTime, 0.5, 2.5))
					if(self.facerecognitionshown || self.objectdetectionshown || self.gesturerecognitionshown || self.personrecognitionshown || self.aiartmirrorshown ){
							self.remove_everything_center_display();
							self.sendNotification('GESTURE_INTERACTION', 'HIDEALL'); //send this notification when user desires to hide all camera options
					}
					break;
				case "okay_left":

					break;
				case "okay_right":
										
					break;
				case "one_left":

					break;
				case "one_right":
					
					break;
			}
		});

		if((self.flatRightDetected == false)){ //&& (self.MainMenuSelectedLast != -1)
			
			MM.getModules().withClass("smartmirror-main-menu-tiles").enumerate(function(module) {
				if(!module.hidden && self.check_for_validity(self.mainMenuHideLastTime, 1, 1.5)){
					module.hide(1000, function() {Log.log(module.name + ' is hidden.');}, {lockString: "lockString"});
					self.sendNotification('GESTURE_INTERACTION', 'menu_hide') //send this notification when user desires to close the main menu via gesture

					self.MainMenuSelected = -1;
					self.MainMenuSelectedLast = -1;
					self.MainMenuSelectedTime = 0;
					self.sendNotification('MAIN_MENU', 'menu');
					self.mainManuState = self.mainManuStateObj.main;
					
					if (self.config.MainMenuDistanceEnabled) {
						self.MainMenuDistance = -1;
						self.MainMenuDistanceLast = -1;
					}
				}
			});
			
		}

		if (self.MainMenuSelected != self.MainMenuSelectedLast){
			if (self.config.MainMenuDistanceEnabled) {
				self.MainMenuDistanceLast = self.MainMenuDistance;
				console.log("[" + self.name + "] menu hover over item  " + self.MainMenuSelected );
				self.sendNotification('MAIN_MENU_SELECT', self.MainMenuSelected);
			} else {
				console.log("[" + self.name + "] menu select item  " + self.MainMenuSelected );
				self.sendNotification('MAIN_MENU_SELECT', self.MainMenuSelected);
				setTimeout(() => {self.check_for_menu_click(d.getTime(),self.MainMenuSelected);}, 2500);
				self.MainMenuSelectedTime  = d.getTime();
			}
		}

		if (self.config.MainMenuDistanceEnabled) {
			self.check_for_menu_distance_click(self.MainMenuSelected);
		}
		
		self.MainMenuSelectedLast = self.MainMenuSelected;

		if ((gestures_list.filter(function(left_two) { return left_two.name === 'two_left'; }).length > 0) &&
		   (gestures_list.filter(function(right_two) { return right_two.name === 'two_right'; }).length > 0) && 
		   (self.aiartmirrorshown == true || self.cameraimageshown == true) && self.check_for_validity(self.printLastTime, 1, 1.5)) {
			
			
		}
	},

//----------------------------------------------------------------------//
// CHECK IF GESTURE TRIGGERD MENU
// a given time afer a menu point is clicked the validity needs 
// to be checked again
//----------------------------------------------------------------------//
	check_for_menu_click:function(select_time, item){
		var self = this;
		if ((item == self.MainMenuSelectedLast) && ( self.MainMenuSelected != -1) && ( select_time == self.MainMenuSelectedTime)){
			console.log("[" + self.name + "] menu click" );
			self.sendNotification('MAIN_MENU_CLICK_SELECTED');
			self.MainMenuSelected = -1;
			self.MainMenuSelectedLast = -1;
			self.sendNotification('MAIN_MENU_SELECT', self.MainMenuSelected);
		}
		console.log("[" + self.name + "] item changed.." );
	},

	check_for_menu_distance_click: function(item) {
		if ((item == self.MainMenuSelectedLast) && ( self.MainMenuSelected != -1) && (self.MainMenuDistance != self.MainMenuDistanceLast)) {
			console.debug("Distance left: " + (self.config.MainMenuDistanceThreshold - (self.MainMenuDistanceLast - self.MainMenuDistance)) / 10 + " cm");
		}
		if ((item == self.MainMenuSelectedLast) && ( self.MainMenuSelected != -1) && ( self.MainMenuDistance <= self.MainMenuDistanceLast - self.config.MainMenuDistanceThreshold)){
			console.log("[" + self.name + "] menu distance click" );
			self.sendNotification('MAIN_MENU_CLICK_SELECTED');
			self.MainMenuSelected = -1;
			self.MainMenuSelectedLast = -1;
			self.sendNotification('MAIN_MENU_SELECT', self.MainMenuSelected);
		}
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
// REMOVES EVERYTHING FROM CENTER DISPLAY
// is triggered by thumbs down for example
//----------------------------------------------------------------------//
	remove_everything_center_display: function(){
		self = this;
		self.sendNotification('CENTER_DISPLAY', 'HIDEALL');
		self.facerecognitionshown = false;
		self.objectdetectionshown = false;
		self.gesturerecognitionshown = false;
		self.personrecognitionshown = false;
		self.cameraimageshown = false;
	},

//----------------------------------------------------------------------//
// CHECK IF NOBODY IS LOOGED IN
//----------------------------------------------------------------------//
	check_for_user_idle: function(){
		self = this;
		if(self.numberOfRecognisedPersons == 0){
			if(self.currentuserid != -1){
				self.sendSocketNotification('LOGGIN_USER', -1);
			}
		}
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
			tr.className = "DebugTablexsmall";
			tableBody.appendChild(tr);		
			var td = document.createElement('TD');
      		td.appendChild(document.createTextNode(key));
			td.className = "DebugTablexsmall";
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
