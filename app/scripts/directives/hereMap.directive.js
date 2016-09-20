'use strict';
angular.module('onTimeApp').component('hereMap', {
  bindings: {
    // Account : '<'
    testin: '='
  },
  controller: function($scope, $element, $attrs, Account) {
      var self = this;
      var defaultLayers = window.platform.createDefaultLayers();
      $scope.$parent.slider.isPageLoaded.then(function() {

        self.$onDestroy = function() {
          console.debug('here map destroyed');
      };
        console.debug('loading map', self, $scope, $element, $attrs);
        // Obtain the default map types from the platform object
        // Instantiate (and display) a map object:
        var map = new window.H.Map(
          //   document.getElementById('map_container'),
          $element[0],
          defaultLayers.normal.map, {
            center: new window.H.geo.Point(Account.getLocation().lat, Account.getLocation().lng),
            zoom: 18
          });
        // MapEvents enables the event system
        // Behavior implements default interactions for pan/zoom (also on mobile touch environments)
        var behavior = new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));

        // Create the default UI components
        // var ui = window.H.ui.UI.createDefault(thisEvent.map, defaultLayers);
        var myElem = document.createElement('div');
        myElem.appendChild(
          document.createElement('div')).className = 'pin bounce';
        myElem.appendChild(
          document.createElement('div')).className = 'pulse';
        var myIcon = new window.H.map.DomIcon(myElem);
        var myMarker = new window.H.map.DomMarker({
          'lng': Account.getLocation().lng,
          'lat': Account.getLocation().lat
        }, {
          icon: myIcon
        });
        map.addObject(myMarker);


        var range = new window.H.map.Circle({
          'lng': Account.getLocation().lng,
          'lat': Account.getLocation().lat
        }, Account.getLocation().accuracy)
        map.addObject(range);

        // Show traffic tiles
        map.setBaseLayer(defaultLayers.normal.traffic);

        // Enable traffic incidents layer
        map.addLayer(defaultLayers.incidents);

        // var icon = new window.H.map.Icon('/images/home_pointer.png');

        // $scope.$parent.map.markers = $scope.$parent.map.markers || {};
        // self.testin = self.testin || [];
        // self.testin.push('x');
        console.log('scope.map ==> ', $scope.$parent.map);
        if (!$scope.$parent.map) {
          $scope.$parent.map = {
            'markers': {}
          };
        }
        var members = $scope.$parent.members.joined;

        for (var m = 0; m < members.length; m++) {
          var profile = members[m];
          if (profile.$id == Account.getId() || !profile.location) {
            continue;
          }

          if (!$scope.$parent.map.markers[profile.$id]) {
            $scope.$parent.map.markers[profile.$id] = new window.H.map.Marker({
              'lng': profile.location.lng,
              'lat': profile.location.lat,
              'data': {
                'uid': profile.$id
              }
            });
            $scope.$parent.map.markers[profile.$id].unwatch = profile.$watch(
              function() {
                console.debug('[profile watch triggered >', profile)
                $scope.$parent.map.markers[profile.$id].setPosition({
                  'lng': profile.location.lng,
                  'lat': profile.location.lat
                });
              });
          }
          var marker = $scope.$parent.map.markers[profile.$id];
          map.addObject(marker);
        }; // end of for members
      });
    } // end of controller
});
