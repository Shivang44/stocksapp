angular.module('starter.controllers', [])

.controller('ViewCtrl', function($scope, $http, $q) {

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
	}

	$scope.$watch('currentStock', function(newValue, oldValue){
		if ($scope.stocks.length > 0) {
			$scope.stockName = $scope.stocks[newValue].symbol;

		//	$scope.fetchHistoricalData($scope.stockName); // Maybe do this in a future update

			for (var i = 0; i < $scope.stocks.length; i++) {
				if ($scope.stocks[i].symbol == $scope.stockName) {
					// See if data is filled
					if (typeof $scope.stocks[i].data === "undefined") {
						// Need to fill in data
						$scope.fetchCurrentData($scope.stockName);
					} else {
						// Data already filled, set values
						$scope.price = $scope.stocks[i].data.LastTradePriceOnly;
						$scope.perChange = $scope.stocks[i].data.PercentChange;
					}
					i = $scope.stocks.length;
				}
			}

		}
	});

	$scope.$watch('perChange', function(newValue, oldValue) {
		if (typeof newValue !== "undefined") {
			if (newValue[0] === "+") {
				$scope.perChangeColor = "#28a54c";
				// Color green
			} else if(newValue[0] === "-") {
				// Color red
				$scope.perChangeColor = "#E11111";
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

	$scope.fetchCurrentData = function(stockSymbol) {

			 var url = 'https://query.yahooapis.com/v1/public/yql?q=select%20LastTradePriceOnly,PercentChange%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22' + stockSymbol +
			 '%22)&format=json&env=http%3A%2F%2Fdatatables.org%2Falltables.env';
			$http({
			  method: 'GET',
			  url: url
			}).then(function successCallback(response) {
				console.log(response);
				var stockSymbolIndex = 0;
				for (var i = 0; i < $scope.stocks.length; i++) {
					if ($scope.stocks[i].symbol == stockSymbol) {
						if (typeof $scope.stocks[i].data === "undefined") {
							// TODO: Make sure to check for all values returned from API. Should NOT be null.
							$scope.stocks[i].data = response.data.query.results.quote;
							$scope.price = response.data.query.results.quote.LastTradePriceOnly;
							$scope.perChange = response.data.query.results.quote.PercentChange;
							i = $scope.stocks.length;
						}
					}
				}


				//$scope.price =  response.data.query.results.quote["LastTradePriceOnly"];
				//$scope.perChange = response.data.query.results.quote["Change"];
			  }, function errorCallback(response) {
				// called asynchronously if an error occurs
				// or server returns response with an error status.
				alert('Something went wrong. Please check your internet connection.');
			  });
	}

	$scope.fetchHistoricalData = function(stockSymbol) {

		// Current timestamp
		var currentTimeStamp = Date.now();

		// We need the following intervals in timestamps: '5d', '1m', '3m', '1y', '2y', '5y', 'my'
		var intervalTimeStamps = [432000000, 2628000000, 7884000000, 31540000000, 63070000000, 157700000000];

		// To figure out the last timestamp (current time - max time) we need to figure out the first date stock was traded (according to yahoo)

		// Get first date
		var urlForFirstDate = 'https://query.yahooapis.com/v1/public/yql?q=select%20start%20from%20yahoo.finance.stocks%20where%20symbol%3D%22' + stockSymbol + '%22&format=json&env=http%3A%2F%2Fdatatables.org%2Falltables.env&callback=';

		$http({
			method: 'GET',
			url: urlForFirstDate
		}).then(function successCallback(response) {
			var firstDateText = response.data.query.results.stock.start;
			var firstCreatedAtStamp = new Date(firstDateText).getTime();
			intervalTimeStamps.push(Date.now() - firstCreatedAtStamp - 432000000); // add 5 days just in case

			// intervalTimeStamps[] should have all of the timestamps differences by now.
			// Time to create dates by doing [Date.now() - timestamp] and converting to date
			// Should be in format 1996-06-30 for yql


			var intervalDates = [];
			for (var i = 0; i < intervalTimeStamps.length; i++) {
				var dateObj = new Date(Date.now() - intervalTimeStamps[i]);
				var year = dateObj.getFullYear();
				var month = dateObj.getMonth() + 1;
				var date = dateObj.getDate();

				if (month < 10) {
					month = "0" + month;
				}

				if (date < 10) {
					date = "0" + date;
				}

				var dateString = year + "-" + month + "-" + date;
				intervalDates.push(dateString);
			}

			// Now we have an interval of dates, we need to do get the closing price for each of those dates
			var url = function(i) {
				return 'https://query.yahooapis.com/v1/public/yql?q=select%20Adj_Close,Date%20from%20yahoo.finance.historicaldata%20where%20symbol%20%3D%20%22' + stockSymbol +
 			'%22%20and%20startDate%20%3D%20%22' + intervalDates[i] + '%22%20and%20endDate%20%3D%20%22' + intervalDates[i] + '%22&format=json&env=http%3A%2F%2Fdatatables.org%2Falltables.env';
			}


			console.log(intervalDates);


			$q.all([
				$http.get(url(0)),
				$http.get(url(1)),
				$http.get(url(2)),
				$http.get(url(3)),
				$http.get(url(4)),
				$http.get(url(5)),
				$http.get(url(6))
			]).then(function(results) {
				console.log(results);
				for (var j = 0; j < results.length; j++) {
					console.log(results[j].data.query.results.quote["Date"] + " : " + results[j].data.query.results.quote["Adj_Close"]);
				}
			});


		}, function errorCallback(response) {
			alert('Something went wrong. Please check your internet connection.');
		});


	}

	$scope.mainFunction = function() {
		// Timeframe to view stocks
		$scope.t = ['1d', '5d', '1m', '3m', '6m', '1y', '2y', '5y', 'my'];
		$scope.t_EN = ['1 day', '5 day', '1 month', '3 month', '6 month', '1 year', '2 year', '5 year', 'max'];

		$scope.fillStockArray();

		// Start with first stock in array
		$scope.currentStock = 0;

		// Start out with 1d
		$scope.currentInterval = 0;

		// Get initial data
		$scope.stockName = $scope.stocks[0].symbol;
		$scope.fetchCurrentData($scope.stockName);


	}

	$scope.fillStockArray = function() {
		// Get stock array
		if(window.localStorage.getItem("stocks")) {
			$scope.stocks = JSON.parse(window.localStorage.getItem("stocks"));
			if ($scope.stocks.length > 0) {
				// Generate graph URL
				$scope.graphURL = 'https://chart.finance.yahoo.com/z?' + '&z=s' + '&t='
				+ $scope.t[0] + '&s=' + $scope.stocks[0].symbol;

				$scope.stockName = $scope.stocks[0].symbol;
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
