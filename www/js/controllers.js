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
  $scope.stockSymbols = [];
  
  $scope.addStock = function(stock) {
	  if ($scope.addDelete == "Add") {
		  if (stock.symbol == "") return;
		  
		  var alreadyAdded = false;
		  if($scope.stockSymbols.indexOf(stock.symbol) > -1) {
			  alreadyAdded = true;
		  }
		  
		  if (stock.symbol.indexOf(",") > -1) {
			  var stockArray = stock.symbol.replace(/\s+/g, '').split(",");
			  for (var i = 0; i < stockArray.length; i++) {
				  if ($scope.stockSymbols.indexOf(stockArray[i]) > -1) {
					  alreadyAdded = true;
				  } else {
					  $scope.stocks.push({symbol: stockArray[i]});
					  $scope.stockSymbols.push(stockArray[i]);
				  }
				  
			  }
		  } else {
		  if ($scope.stockSymbols.indexOf(stock.symbol) < 0) {
			  $scope.stocks.push({symbol: stock.symbol});
			  $scope.stockSymbols.push(stock.symbol);
		  }
			  
		  }
		  stock.symbol = "";
		  if (alreadyAdded) alert("Stock(s) already added!");
	  } else {
		  for (var i = 0; i < $scope.selected.length; i++) {
			  var index = $scope.stockSymbols.indexOf($scope.selected[i]);
			  var stockName = $scope.stockSymbols[index];
			  if (index > -1 ) {
				  $scope.stockSymbols.splice(index, 1);
				  $scope.selected.splice($scope.selected.indexOf(stockName), 1);
				  console.log(index);
				  //$scope.stocks.splice();
			  }
		  }
		  console.log($scope.selected);
	  }
  }
  
  $scope.selected = [];
  $scope.clicked = function(stock) {
	 var index = $scope.selected.indexOf(stock.symbol);
	 if (index > -1){
		 $scope.selected.splice(index, 1);
		 stock.selected = false;
	 } else {
		 $scope.selected.push(stock.symbol);
		 stock.selected = true;
	 }
  }
  
  $scope.$watch('selected.length', function(oldVal, newVal){
	  console.log($scope.selected);
	  if ($scope.selected.length > 0) {
		  $scope.addDelete = "Delete";
	  } else {
		  $scope.addDelete = "Add";
	  }
  }, true);

});
