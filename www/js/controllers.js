angular.module('starter.controllers', [])

.controller('ViewCtrl', function($scope) {})

.controller('AddCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.stocks = [];
  $scope.addStock = function(stock) {
	  if (stock.symbol.indexOf(",") > -1) {
		  // Comma seperated
		  var stockArray = stock.symbol.replace(/\s+/g, '').split(",");
		  for (var i = 0; i < stockArray.length; i++) {
			  $scope.stocks.push({symbol: stockArray[i]});
		  }
	  } else {
		  $scope.stocks.push({symbol: stock.symbol});
	  }
	  stock.symbol = "";
	  console.log($scope.stocks);
  }
  $scope.removeStock = function(index) {
	  $scope.stocks.splice(index, 1);
  }

});
