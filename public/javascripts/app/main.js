'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var serviceName = 'Enginner Fighter';
var thisServer = 'http://localhost:3000/';
var socket = io.connect(thisServer);

var screen_width = 640;
var screen_height = 290;
var player02_width = 80;
var player02_height = 80;
var player01_image = thisServer + 'images/player01.gif';
var player02_image = thisServer + 'images/player02.gif';
var bg_battle_image01 = thisServer + 'images/bg_battle01.jpg';

var assets = [player01_image, player02_image, bg_battle_image01];

// const name = window.prompt('ユーザー名を入力してください');

var player01 = void 0;

var playerInfo = {
	id: '',
	loginName: 'イギー',
	x: screen_width / 5,
	y: 220,
	nameX: 0,
	nameY: 0,
	frame: 1,
	settingFile: thisServer + 'data/player01.json',
	img: thisServer + 'images/main.png'
};
var player = null;
var otherPlayers = {};

enchant();

// 繋がった時の処理
socket.on('connect', function () {

	Push.create('Enginner Fighter', {
		body: playerInfo.loginName + 'がログインしました。',
		icon: {
			x32: '' + playerInfo.img
		},
		timeout: 3000
	});

	playerInfo.id = socket.id;

	socket.emit('name', playerInfo);
});

window.onload = function () {

	if (window.GamepadEvent) {
		window.addEventListener('gamepadconnected', function (e) {
			console.log("ゲームパッドが接続されました。");
			console.log(e.gamepad);
		});
	}

	var gamepad = navigator.getGamepads && navigator.getGamepads()[0];

	function errorLog() {
		console.log("Fail!");
		console.log(XMLHttpRequest.status);
		console.log(textStatus);
	}

	var game = new Game(screen_width, screen_height);
	game.preload(assets);
	game.fps = 30;
	game.keybind(32, 'space');
	game.keybind(65, 'a');
	game.onload = function () {

		var root = game.rootScene;
		var input = game.input;
		var player_speed = 15;

		var LifeP1 = new Entity();
		LifeP1.width = screen_width / 2 - 10;
		LifeP1.height = 20;
		LifeP1.x = 10;
		LifeP1.y = 10;
		LifeP1.backgroundColor = '#27e4b2';

		var LifeP2 = new Entity();
		LifeP2.width = -screen_width / 2 + 10;
		LifeP2.height = 20;
		LifeP2.x = screen_width - 10;
		LifeP2.y = 10;
		LifeP2.backgroundColor = '#27e4b2';

		var scene = new Scene();
		var bg = new Sprite(screen_width, screen_height);
		bg.image = game.assets[bg_battle_image01];
		bg.x = 0;
		bg.y = 0;

		socket.on('name', function (otherPlayerInfo) {

			var id = otherPlayerInfo.id;
			var otherPlayer = otherPlayers[id] = new Sprite(64, 64);
			otherPlayer.id = id;
			otherPlayer.x = 0;
			otherPlayer.y = 0;

			otherPlayer.setPosition = function (pos) {
				otherPlayer.x = pos.x;
				otherPlayer.y = pos.y;
				otherPlayer.frame = pos.frame;
			};
			otherPlayer.setPosition.bind(otherPlayerInfo);

			// player01のジャンプ
			socket.on('pushUp01:' + id, function (pos) {
				player01.x = pos.x;
				player01.y = pos.y;
				player01.frame = pos.frame;
				console.log('y: ' + player01.y + ', frame: ' + player01.frame);
			});

			// player01の右移動
			socket.on('pushRight01:' + id, function (pos) {
				player01.x = pos.x;
				player01.y = pos.y;
				player01.frame = pos.frame;
				console.log('x: ' + player01.x + ', frame: ' + player01.frame);
			});

			// player01のかかみ
			socket.on('pushDown01:' + id, function (pos) {
				player01.x = pos.x;
				player01.y = pos.y;
				player01.frame = pos.frame;
				console.log('y: ' + player01.y + ', frame: ' + player01.frame);
			});

			// player01の左移動
			socket.on('pushLeft01:' + id, function (pos) {

				// let moveEvent = document.createEvent('Event');
				// moveEvent.initEvent('keydown', true, true);
				// moveEvent.keyCode = 37;
				// document.dispatchEvent(moveEvent);

				player01.x = pos.x;
				player01.y = pos.y;
				console.log('x: ' + player01.x + ', frame: ' + player01.frame);

				return;
			});
		});

		var Player01 = Class.create(Sprite, {
			initialize: function initialize(playerInfo) {
				var _this = this;

				var ground = 220;
				var preInput = false;
				var jump = false;

				Sprite.call(this, 64, 64);
				this.playerInfo = playerInfo;
				this.setSettingFile(playerInfo.settingFile);
				this.image = game.assets[player01_image];
				this.scaleX = -1;
				this.x = this.playerInfo.x;
				this.y = this.playerInfo.y;
				// 名前
				this.loginName = new Label(this.playerInfo.loginName);
				this.loginName.width = 100;
				this.loginName.color = 'black';
				this.loginName.x = this.x + 10;
				this.loginName.y = this.y - 15;
				this.frame = 0;
				this.on('enterframe', function () {
					var tempy = _this.y;
					var gravity = 1.0;

					_this.frame = 0;
					_this.scaleX = -1;

					if (input.up && !preInput && !jump) {
						gravity = -12.0;
						jump = true;

						_this.loginName.y = _this.y - 15;

						socket.emit('pushUp01', {
							x: _this.x,
							y: _this.y,
							frame: _this.frame
						});
					}
					if (input.right) {
						_this.x += player_speed;
						_this.loginName.x += player_speed;
						_this.frame = _this.age % 3 + 1;
						socket.emit('pushRight01', {
							x: _this.x,
							y: _this.y,
							nameX: _this.loginName.x,
							nameY: _this.loginName.y,
							frame: _this.frame
						});
					}

					if (input.down) {
						_this.frame = 8;
						socket.emit('pushDown01', {
							x: _this.x,
							y: _this.y,
							frame: _this.frame
						});
					}

					if (input.left) {
						_this.scaleX = 1;
						_this.x -= player_speed;
						_this.loginName.x -= player_speed;
						_this.frame = _this.age % 3 + 1;
						socket.emit('pushLeft01', {
							x: _this.x,
							y: _this.y,
							frame: _this.frame
						});
					}

					_this.y += _this.y - ground + gravity;

					if (_this.y > 220) {
						_this.y = 220;
						jump = false;
					}

					ground = tempy;
					preInput = input.up;

					var left = 0;
					var top = 0;
					var right = screen_width - _this.width;
					var bottom = screen_height - _this.heigh;


					if (_this.x < left || _this.loginName.x < left) {
						_this.x = left;
						_this.loginName.x = left;
					} else if (_this.x > right || _this.loginName.x > right) {
						_this.x = right;
						_this.loginName.x = right;
					}
					if (_this.y < top || _this.loginName.y < top) {
						_this.y = top;
						_this.loginName.y = top;
					} else if (_this.y > bottom || _this.loginName.y > bottom) {
						_this.y = bottom;
						_this.loginName.y = bottom;
					}
				});

				return this;
			},
			setSettingFile: function setSettingFile(settingFile) {
				this.settingFile = settingFile;
				var core = enchant.Core.instance;
				if (core.assets[this.settingFile]) {
					this.setSetting(core.assets[this.settingFile]);
				}
			},
			setSetting: function setSetting(setting) {
				var info = JSON.parse(setting);

				this.width = info.width;
				this.height = info.height;
				this.x = info.x;
				this.y = info.y;
				console.log(this.x);
				this.setImage(info.image);
			},
			attack: function attack() {
				this.frame = this.age % 3 + 4;
				console.log(player01);
			}
		});

		var Attack01 = Class.create(Sprite, {
			initialize: function initialize(x, y) {
				sprite.call(this, 64, 64);
				this.destroy = false;
				this.x = x;
				this.y = y;
				this.on('enterframe', function () {
					if (game.input.a) {
						Attack01Fuc();
					}
					console.log(Attack01);
				});
			}
		});

		var Player03 = function Player03(x, y) {
			_classCallCheck(this, Player03);

			var player03_img = new Image();
			player03_img.src = 'http://localhost:3000/images/bigmonster2.gif';
			this.x = x;
			this.y = y;
			this.width = 254;
			this.height = 254;
			this.image = game.assets[player01_image];
			this.frame = 0;
		};

		var Player02 = Class.create(Sprite, {
			initialize: function initialize(x, y) {
				var _this2 = this;

				Sprite.call(this, 64, 64);
				this.image = game.assets[player02_image];
				var p01_image = this.image;
				this.x = x;
				this.y = y;
				this.scaleX = 1;
				this.frame = 0;
				this.on('enterframe', function () {
					_this2.frame = _this2.direction * 3 + _this2.walk;
				});
			}
		});

		function Attack01Fuc() {
			var attack01 = new Attack01();
			root.addChild(attack01);
			console.log(attack01);
		}

		function topScene() {
			var scene = new Scene();
			var bg = new Sprite(screen_width, screen_height);

			return scene;
		}

		function battleScene() {
			root.addChild(bg);
			root.addChild(LifeP1);
			root.addChild(LifeP2);

			player01 = new Player01(playerInfo);
			root.addChild(player01);
			root.addChild(player01.loginName);

			var player02 = new Player02(screen_width / 1.5, 220);
			root.addChild(player02);

			var player03 = new Player03(screen_width / 2, 100);

			if (player01.x > player02.x) {
				player01.scaleX = 1;
				console.log(player01);
			}
			return scene;
		}

		game.rootScene.on('enterframe', function () {

			topScene();

			if (game.input.space) {
				battleScene();
			}
		});
	};
	game.start();
};