angular.module('onTimeApp').controller('locationPickerCtrl',
  function($scope, Account, $timeout) {
    var defaultLayers = window.platform.createDefaultLayers();
    var pickerMap;
    $scope.searchLocationResults = {}
    var geocoderService = platform.getGeocodingService();
    var isSearching;
    $scope.searchLocationResults = [];



    var geocode = function(addr) {
      console.debug('geocodeing >>', addr);

      geocoderService.geocode({
          searchText: addr
        },
        //onSucess
        function(result) {
          console.log(result);
          var view = result.Response.View[0] || [];
          $scope.searchLocationResults = view.Result;
          $scope.$apply();
        },
        function(e) {
          // onFail
          $scope.searchLocationResults = [];
          alert('Unable to reach server to search for address.');
          console.error(e)
        });

    }

    $scope.searchLocation = function(addr) {
      if (isSearching) {
        $timeout.cancel(isSearching);
      }
      if (!addr) {
        $scope.searchLocationResults = [];
      } else {
        isSearching = $timeout(geocode, 1000, false, addr);
      }
    }

    $scope.loadMap = function() {
      if (!!pickerMap) {
        return;
      };
      pickerMap = new window.H.Map(
        //   document.getElementById('map_container'),
        $('#here_map')[0],
        defaultLayers.normal.map, {
          center: new window.H.geo.Point(Account.getLocation().lat, Account.getLocation().lng),
          zoom: 18
        });
      var behavior = new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(pickerMap));
      //
    }

    $scope.addLocation = function() {
      if (!$scope.locationSearchQuery) {
        window.alert('Location address can\'t be empty');
      }
      var ipoint = pickerMap.getCenter();
      ipoint.address = $scope.locationSearchQuery;
      $scope.$parent.plan.meta.$ref().child('locations').push(ipoint);
      $scope.closeLocationPicker();
    }

    $scope.closeLocationPicker = function() {
      $scope.$parent.locationPicker.hide();
    }

    $scope.selectResult = function(result) {
      console.debug('result selected>>', result);
      pickerMap.setCenter({
        lat: result.Location.DisplayPosition.Latitude,
        lng: result.Location.DisplayPosition.Longitude
      });
      $scope.locationSearchQuery = result.Location.Address.Label;
    }
    window.ss = $scope;
  });
