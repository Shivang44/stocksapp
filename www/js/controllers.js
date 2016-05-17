angular.module('starter.controllers', [])

.controller('ViewCtrl', function($scope) {
	
	
	
	// Initial
	$scope.$on('$ionicView.enter', function(e) {
		// Timeframe to view stocks
		var t = ['1d', '5d', '1m', '3m', '1y', '2y', '5y', 'my'];
	
		// Stock graph size
		var z = 's';
		
		// Start with first stock in array
		$scope.currentStock = 0;
		
		// Start out with 1d
		$scope.currentTime = 0;
		
		var graphURL = 'https://chart.finance.yahoo.com/z?' + '&z=' + z + '&t=' + t[$scope.currentTime] + '&s=';
		console.log($scope.stocks);
		
		
		
    });
	
	
})

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
  }
  
  $scope.selected = [];
  $scope.clicked = function(stock) {
	 var index = $scope.selected.indexOf(stock.symbol);
	 console.log(index);
	 if (index > -1){
		 $scope.selected.splice(index, 1);
		 stock.selected = false;
	 } else {
		 $scope.selected.push(stock.symbol);
		 stock.selected = true;
	 }
  }

});
