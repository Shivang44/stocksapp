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
		$scope.currentInterval = 0;
		
		var graphURL = 'https://chart.finance.yahoo.com/z?' + '&z=' + z + '&t=' + t[$scope.currentInterval] + '&s=';

		
		
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
  
  
  $scope.$parent.$on('$ionicView.enter', function(e) {
	  $scope.stocks = [];
	  $scope.stockSymbols = [];
	  $scope.selected = [];
	  if(window.localStorage.getItem("stocks")) {
		  // Fill stock (array of objects)
		  if (window.localStorage.getItem("stocks") !== "undefined") {
			$scope.stocks = JSON.parse(window.localStorage.getItem("stocks"));

			  // Fill array of stock symbols
			  for (var i = 0; i < $scope.stocks.length; i++) {
				$scope.stockSymbols[i] = $scope.stocks[i].symbol;
			  }
		  }
		  
	  }
	  console.log($scope.stocks);
	  console.log($scope.stockSymbols);
  });

 
  
  $scope.$watchCollection('stocks', function(newValue, oldValue) {
	  if (newValue != oldValue)
		window.localStorage.setItem('stocks', JSON.stringify($scope.stocks));
  });
  
  $scope.addStock = function(stock) {
	  // user wants to either add or delete
	  
	  if ($scope.addDelete == "Add") {
		// User wants to add
		if (stock.symbol == "" || stock.symbol == " ") return;
		  var alreadyAdded = false;
		  if($scope.stockSymbols.indexOf(stock.symbol) > -1) {
			  alreadyAdded = true;
		  }
		  
		  if (stock.symbol.indexOf(",") > -1) {
			  var stockArray = stock.symbol.replace(/\s+/g, '').split(",");
			  console.log(stockArray);
			  for (var i = 0; i < stockArray.length; i++) {
				  if ($scope.stockSymbols.indexOf(stockArray[i]) > -1) {
					  alreadyAdded = true;
				  } else {
						  if (stockArray[i] != "") {
							$scope.stocks.push({symbol: stockArray[i]});
							$scope.stockSymbols.push(stockArray[i]);
						  }
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
		  // User wants to delete
		  var selectedLength = $scope.selected.length;
		  for (var i = 0; i < selectedLength; i++) {
			  // We need to delete stock from stocks[] array as well as stockSymbols[] array
			  var stockSymbolsIndex = $scope.stockSymbols.indexOf($scope.selected[i]);
			  $scope.stockSymbols.splice(stockSymbolsIndex ,1);
			  for (var j = 0; j < $scope.stocks.length; j++) {
				if ($scope.stocks[j].symbol == $scope.selected[i]) {
					$scope.stocks.splice(j, 1);
				}
			  }
			  
		  }
		  // Clear any selected stocks
		  $scope.selected = [];
		  
	  }
  }
  
  // Manage selecting/unselecting for deletion
  $scope.selected = [];
  $scope.clicked = function(stock) {
	 var index = $scope.selected.indexOf(stock.symbol);
	 if (index > -1){
		 $scope.selected.splice(index, 1);
		 //stock.selected = false;
	 } else {
		 $scope.selected.push(stock.symbol);
		// stock.selected = true;
	 }
  }
  
  // Change text of main button if we're adding or deleting
  $scope.$watch('selected', function(newVal, oldVal){
	  if ($scope.selected.length > 0) {
		  $scope.addDelete = "Delete";
	  } else {
		  $scope.addDelete = "Add";
	  }
  }, true);

});
