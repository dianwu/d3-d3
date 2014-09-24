// DianTW-3588
function MyCtrl($scope, $http, $route, $routeParams, $location, $filter) {
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
	$scope.battleTag = 'DianTW-3588';
	$scope.selectedHero = '';
	$scope.selectedAttr = '';
	$scope.itemDatas = {};
	$scope.itemAttrs = {};
	$scope.stdItemDatas = {};
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
			$scope.itemDatas={};
			angular.forEach(PARTS, function(part) {
				loadItemDate(data.items[part].tooltipParams);
				loadStdItemData(data.items[part].id);
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
			angular.forEach(data.attributesRaw, function(attrValue, attrKey) {
				$scope.itemAttrs[attrKey] = $scope.itemAttrs[attrKey] || [];
				attrValue.id = itemId;
				$scope.itemAttrs[attrKey].push(attrValue);
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

	function loadStdItemData(itemId){
		$http.jsonp(
			'https://' + $scope.myServer.host + ITEM_PATH + 'item/' + itemId + callBack
		).
		success(function(data, status, headers, config) {
			// this callback will be called asynchronously
			// when the response is available
			$scope.stdItemDatas[itemId] = data;
		}).
		error(function(data, status, headers, config) {
			// called asynchronously if an error occurs
			// or server returns response with an error status.
		});
	}

	$scope.selectHero = function() {
		loadHero($scope.selectedHero.id);
	};

	function getMyItem(itemId) {
		return $scope.itemDatas[itemId];
	}

	$scope.selectAttr = function(v) {
		// $filter('filter')($scope.itemDatas, function (a){
		// 	console.log('selectAttr a',a);
		// }, function (actual, expected){
		// 	console.log('selectAttr actual',actual);
		// 	console.log('selectAttr expected',expected);
		// });
		drawAttr($scope.selectedAttr);
	};
	
	function drawAttr(v) {
		var width = 960,
			height = 500,
			radius = Math.min(width, height) / 2 - 50;

		var arc = d3.svg.arc()
			.outerRadius(radius - 10)
			.innerRadius(0);

		var pie = d3.layout.pie()
			.sort(null)
			.value(function(d) {
				// var attr=getMyItem(d).attributesRaw[$scope.selectedAttr];
				// console.log('pie', getMyItem(d), $scope.selectedAttr);
				return (d.max + d.min) / 2;
			});
		var pieData = pie($scope.selectedAttr);
		var color = d3.scale.category20b();

		var svg = d3.select('#chart')
			.html('').append("svg")
			.attr("width", width)
			.attr("height", height)
			.append("g")
			.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

		var g = svg.selectAll(".arc")
			.data(pieData)
			.enter().append("g")
			.attr("class", "arc");

		g.append("path")
			.attr("d", arc)
			.style("fill", function(d, i) {
				return color(i);
			});

		var label_group = svg.append("svg:g")
			.attr("class", "label_group")
			.attr("transform", "translate(0, 0)");

		var textOffset = 14;
		var r = 100;
		var valueLabels = label_group.selectAll("text.value").data(pieData)
			.attr("dy", function(d) {
				if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
					return 5;
				} else {
					return -7;
				}
			})
			.attr("text-anchor", function(d) {
				if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
					return "beginning";
				} else {
					return "end";
				}
			})
			.text(function(d) {
				return '1';
			});

		valueLabels.enter().append("svg:text")
			.attr("class", "value")
			.attr("transform", function(d) {
				return "translate(" + Math.cos(((d.startAngle + d.endAngle - Math.PI) / 2)) * (radius + textOffset) + "," + Math.sin((d.startAngle + d.endAngle - Math.PI) / 2) * (radius + textOffset) + ")";
			})
			.attr("dy", function(d) {
				if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
					return 5;
				} else {
					return -7;
				}
			})
			.attr("text-anchor", function(d) {
				if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
					return "beginning";
				} else {
					return "end";
				}
			}).text(function(d) {
				return Math.round(((d.data.max + d.data.min) / 2) * 100) / 100;
			});

		valueLabels.exit().remove();

		var nameLabels = label_group.selectAll("text.units").data(pieData)
			.attr("dy", function(d) {
				if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
					return 17;
				} else {
					return 5;
				}
			})
			.attr("text-anchor", function(d) {
				if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
					return "beginning";
				} else {
					return "end";
				}
			}).text(function(d) {
				return d.name;
			});

		nameLabels.enter().append("svg:text")
			.attr("class", "units")
			.attr("transform", function(d) {
				return "translate(" + Math.cos(((d.startAngle + d.endAngle - Math.PI) / 2)) * (radius + textOffset) + "," + Math.sin((d.startAngle + d.endAngle - Math.PI) / 2) * (radius + textOffset) + ")";
			})
			.attr("dy", function(d) {
				if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
					return 17;
				} else {
					return 5;
				}
			})
			.attr("text-anchor", function(d) {
				if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
					return "beginning";
				} else {
					return "end";
				}
			}).text(function(d) {
				return $scope.itemDatas[d.data.id].name;
			});
	}
}

var app = angular.module('MyApp', ['ngRoute']);
app.controller('MyCtrl', MyCtrl);