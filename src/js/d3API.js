// DianTW-3588
function MyCtrl($scope, $http, $route, $routeParams, $location) {
	var PROFILE_PATH = '/api/d3/profile/',
		HERO_PATH = '/hero/',
		ITEM_PATH = '/api/d3/data/',
		PARTS = ['head', 'torso', 'bracers', 'feet', 'hands', 'leftFinger', 'legs', 'mainHand', 'neck', 'offHand', 'rightFinger', 'shoulders', 'waist'],
		callBack = '?callback=JSON_CALLBACK';
	$scope.servers = [{
		name: 'Americas',
		host: 'us.battle.net'
	}, {
		name: 'Europe',
		host: 'eu.battle.net'
	}, {
		name: 'Asia',
		host: 'tw.battle.net'
	}];
	$scope.myServer = $scope.servers[2];
	$scope.profileData = {};
	$scope.battleTag = ($location.search() || {
		battleTag: ''
	}).battleTag;
	$scope.selectedHero = '';
	$scope.selectedAttr = '';
	$scope.itemDatas = {};
	$scope.itemAttrs = {};

	var path;

	this.loadBattleTag = function() {
		$http.jsonp(
			'https://' + $scope.myServer.host + PROFILE_PATH + ($scope.battleTag.replace('#', '-')) + '/' + callBack
		).
		success(function(data, status, headers, config) {
			// this callback will be called asynchronously
			// when the response is available
			$scope.profileData = data;
		}).
		error(function(data, status, headers, config) {
			// called asynchronously if an error occurs
			// or server returns response with an error status.
		});
	};

	function loadHero(heroId) {
		$http.jsonp(
			'https://' + $scope.myServer.host + PROFILE_PATH + ($scope.battleTag.replace('#', '-')) + HERO_PATH + heroId + callBack
		).
		success(function(data, status, headers, config) {
			// this callback will be called asynchronously
			// when the response is available
			$scope.heroData = data;
			console.log('$scope.heroData.items', $scope.heroData);
			angular.forEach(PARTS, function(part) {
				console.log('part :', part, data.items[part]);
				loadItemDate(data.items[part].tooltipParams);
			});
		}).
		error(function(data, status, headers, config) {
			// called asynchronously if an error occurs
			// or server returns response with an error status.
		});
	}

	function loadItemDate(itemId) {
		$http.jsonp(
			'https://' + $scope.myServer.host + ITEM_PATH + itemId + callBack
		).
		success(function(data, status, headers, config) {
			// this callback will be called asynchronously
			// when the response is available
			$scope.itemDatas[itemId] = data;
			var attr;
			console.log('=== loadItemDate ===');
			angular.forEach(data.attributesRaw, function(attrValue, attrKey) {
				$scope.itemAttrs[attrKey] = $scope.itemAttrs[attrKey] || [];
				$scope.itemAttrs[attrKey].push(attrValue);
				console.log('attrRaw', attrKey, $scope.itemAttrs[attrKey].length);
				// attr.max = attr.max || 0;
				// attr.min = attr.min || 0;
				// attr.max += attrValue.max;
				// attr.min += attrValue.min;
				// $scope.itemAttrs[attrKey] = attr;
			});
		}).
		error(function(data, status, headers, config) {
			// called asynchronously if an error occurs
			// or server returns response with an error status.
		});
	}

	$scope.selectHero = function() {
		loadHero($scope.selectedHero.id);
	};

	$scope.drawAttr = function() {
		var width = 960,
			height = 500,
			radius = Math.min(width, height) / 2;

		var arc = d3.svg.arc()
			.outerRadius(radius - 10)
			.innerRadius(0);

		var pie = d3.layout.pie()
			.sort(null)
			.value(function(d) {
				return (d.max + d.min) / 2;
			});

		var color = d3.scale.category20b();

		var svg = d3.select('#chart')
			.html('').append("svg")
			.attr("width", width)
			.attr("height", height)
			.append("g")
			.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

		var g = svg.selectAll(".arc")
			.data(pie($scope.selectedAttr))
			.enter().append("g")
			.attr("class", "arc");

		g.append("path")
			.attr("d", arc)
			.style("fill", function(d, i) {
				console.log('color', i); return color(i);
			});  
	};
}

var app = angular.module('MyApp', ['ngRoute']);
app.controller('MyCtrl', MyCtrl);