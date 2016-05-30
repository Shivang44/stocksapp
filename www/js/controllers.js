angular.module('starter.controllers', [])

.controller('ViewCtrl', function($scope, $http) {

	// Initialize
	if (typeof $scope.stocks == "undefined") $scope.stocks = [];
	if (typeof $scope.t_EN == "undefined") $scope.t_EN = [];
	if (typeof $scope.newStockData == "undefined") $scope.newStockData = [];

	// Data we want:
	// LastTradePriceOnly => Current price
	// PercentChange => Change in percent for today

	$scope.$watch('currentInterval', function(newValue, oldValue){
			$scope.interval = $scope.t_EN[newValue];
	});

	$scope.debugChange = function(n) {

		if (n == 0)
			$scope.currentStock++;
		else
			$scope.currentInterval++;
		$scope.newStock();
		console.log($scope.currentStock);
	}

	$scope.$watch('currentStock', function(newValue, oldValue){
		if ($scope.stocks.length > 0) {
			$scope.stockName = $scope.stocks[newValue].symbol;

			for (var i = 0; i < $scope.stocks.length; i++) {
				if ($scope.stocks[i].symbol == $scope.stockName) {
					// See if data is filled
					if (typeof $scope.stocks[i].data === "undefined") {
						// Need to fill in data
						$scope.fetchCurrentData($scope.stockName);
					} else {
						// Data already filled, set values
						console.log($scope.stocks);
						$scope.price = $scope.stocks[i].data.LastTradePriceOnly;
						$scope.perChange = $scope.stocks[i].data.Change;
					}
					i = $scope.stocks.length;
				}
			}

		}


	});


	$scope.onSwipe = function(direction) {
			switch(direction) {
				case "left":
					$scope.currentInterval++;
					break;
				case "right":
					$scope.currentInterval--;
					break;
				case "up":
					$scope.currentStock++;
					break;
				case "down":
					$scope.currentStock--;
					break;

			}
			$scope.newStock();
			window.plugins.nativepagetransitions.slide({"direction":direction});


	}

/*
	$scope.$watch('newStockData', function(newValue, oldValue){
		console.log(newValue);
		if (newValue.length > 0) {
			$scope.price = newValue[$scope.currentStock]["LastTradePriceOnly"];
			$scope.perChange = newValue[$scope.currentStock]["Change"];
		}
	}, true);*/

	$scope.fetchCurrentData = function(stockSymbol) {

			 var url = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22' + stockSymbol +
			 '%22)&format=json&env=http%3A%2F%2Fdatatables.org%2Falltables.env';
			$http({
			  method: 'GET',
			  url: url
			}).then(function successCallback(response) {
				var stockSymbolIndex = 0;
				for (var i = 0; i < $scope.stocks.length; i++) {
					if ($scope.stocks[i].symbol == stockSymbol) {
						if (typeof $scope.stocks[i].data === "undefined") {
							// TODO: Make sure to check for all values returned from API. Should NOT be null.
							$scope.stocks[i].data = response.data.query.results.quote;
							$scope.price = response.data.query.results.quote.LastTradePriceOnly;
							$scope.perChange = response.data.query.results.quote.Change;
							i = $scope.stocks.length;
						}
					}
				}
				console.log($scope.stocks);


				//$scope.price =  response.data.query.results.quote["LastTradePriceOnly"];
				//$scope.perChange = response.data.query.results.quote["Change"];
			  }, function errorCallback(response) {
				// called asynchronously if an error occurs
				// or server returns response with an error status.
				alert('Something went wrong. Please check your internet connection.');
			  });
	}

	$scope.mainFunction = function() {
		// Timeframe to view stocks
		$scope.t = ['1d', '5d', '1m', '3m', '1y', '2y', '5y', 'my'];
		$scope.t_EN = ['1 day', '5 day', '1 month', '3 month', '1 year', '2 year', '5 year', 'max'];

		// Start with first stock in array
		$scope.currentStock = 0;

		// Start out with 1d
		$scope.currentInterval = 0;

		$scope.fillStockArray();

	}

	$scope.fillStockArray = function() {
		// Get stock array
		if(window.localStorage.getItem("stocks")) {
			$scope.stocks = JSON.parse(window.localStorage.getItem("stocks"));
			if ($scope.stocks.length > 0) {
				// Generate graph URL
				$scope.graphURL = 'https://chart.finance.yahoo.com/z?' + '&z=s' + '&t='
				+ $scope.t[$scope.currentInterval] + '&s=' + $scope.stocks[$scope.currentStock].symbol;


			}


		} else {
			$scope.stocks = [];
		}
	}

	$scope.newStock = function () {
		if ($scope.stocks.length > 0) {

			// If going past max time, just loop back around
			if ($scope.currentInterval == $scope.t.length) $scope.currentInterval = 0;

			// If initally going left (index = -1) go to max
			if ($scope.currentInterval == -1) $scope.currentInterval = $scope.t.length - 1;

			// If going past max stocks
			if ($scope.currentStock == $scope.stocks.length) $scope.currentStock = 0;

			// If initially going up, show last stock
			if ($scope.currentStock == -1) $scope.currentStock = $scope.stocks.length - 1;


				$scope.graphURL = 'https://chart.finance.yahoo.com/z?' + '&z=s' + '&t='
				+ $scope.t[$scope.currentInterval] + '&s=' + $scope.stocks[$scope.currentStock].symbol;
		}
	}


	// Initial
	$scope.$on('$ionicView.enter', function() {
		$scope.mainFunction();
	});


})

.controller('AddCtrl', function($scope, $state) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});


  $scope.$on('$ionicView.enter', function(e) {
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
  });



  $scope.$watchCollection('stocks', function(newValue, oldValue) {


	  if (newValue != oldValue) {
			window.localStorage.setItem('stocks', JSON.stringify($scope.stocks));
		}

  });

  $scope.addStock = function(stock) {
	// user wants to either add or delete
	  if ($scope.addDelete == "Add") {
		// User wants to add
		stock.symbol = stock.symbol.toUpperCase();
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
