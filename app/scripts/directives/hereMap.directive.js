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

        // Show traffic tiles
        map.setBaseLayer(defaultLayers.normal.traffic);

        // Enable traffic incidents layer
        map.addLayer(defaultLayers.incidents);


        $scope.$parent.map.ui = map;


        // make sure there are no markers for me already
        if (!$scope.$parent.map.myMarker) {
          // Create the default UI components
          // var ui = window.H.ui.UI.createDefault(thisEvent.map, defaultLayers);
          var myElem = document.createElement('div');
          myElem.appendChild(
            document.createElement('div')).className = 'pin bounce';
          myElem.appendChild(
            document.createElement('div')).className = 'pulse';
          var myIcon = new window.H.map.DomIcon(myElem);
          $scope.$parent.map.myMarker = new window.H.map.DomMarker({
            'lng': Account.getLocation().lng,
            'lat': Account.getLocation().lat
          }, {
            icon: myIcon
          });
          $scope.$parent.map.myMarker.range = new window.H.map.Circle({
            'lng': Account.getLocation().lng,
            'lat': Account.getLocation().lat
          }, Account.getLocation().accuracy)

          // setup the location watcher to change myMarker on location change
          $scope.$parent.map.myMarker.unwatch = Account.addMyLocationWatcher(function(location) {
            var myIPoint = {
              'lng': location.lng,
              'lat': location.lat
            };
            $scope.$parent.map.myMarker.setPosition(myIPoint);

            $scope.$parent.map.myMarker.range.setCenter(myIPoint);
            $scope.$parent.map.myMarker.range.setRadius(location.accuracy);

            $scope.$parent.map.ui.setCenter(myIPoint);
            //
            var linesKeys = Object.keys($scope.$parent.map.lines);
            for (var l = 0; l < linesKeys.length; l++) {
                //update the line
                var newStrip = $scope.$parent.map.lines[linesKeys[l]].getStrip();
                newStrip.removePoint(0);
                newStrip.insertPoint(0,myIPoint);
                $scope.$parent.map.lines[linesKeys[l]].setStrip(newStrip);
            }
          });
        } //end if
        map.addObject($scope.$parent.map.myMarker);
        map.addObject($scope.$parent.map.myMarker.range);
        // var icon = new window.H.map.Icon('/images/home_pointer.png');

        console.log('scope.map ==> ', $scope.$parent.map);
        // if (!$scope.$parent.map) {
        //   $scope.$parent.map = {
        //     'markers': {}
        //   };
        // }

        var members = $scope.$parent.members.joined;
        for (var m = 0; m < members.length; m++) {
          var member = members[m];
          if (member.$id == Account.getId() || !member.location) {
            //ignore my location and accounts without IDs
            console.debug('continue: ignoring my account');
            continue;
          }

          // there are no markers for the indexed member
          // create a new marker and watcher
          if (!$scope.$parent.map.markers[member.$id]) {
            // set the original location of the marker
            $scope.$parent.map.markers[member.$id] = new window.H.map.Marker({
              'lng': member.location.lng,
              'lat': member.location.lat,
              'data': {
                'uid': member.$id
              }
            });

            // set the listener for the on change of users locations
            $scope.$parent.map.markers[member.$id].unwatch = member.$watch(
              function(event) {

                var uid = event.key;
                console.debug('Member watch triggered >>', uid, '\n>>', this);

                var point = {
                  'lng': this.location.lng,
                  'lat': this.location.lat
                };
                $scope.$parent.map.markers[this.$id].setPosition(point);

                //update the line
                var newStrip = $scope.$parent.map.lines[this.$id].getStrip();
                newStrip.removePoint(1);
                newStrip.insertPoint(1,point);
                $scope.$parent.map.lines[member.$id].setStrip(newStrip);

              }, member); // end watch()

              // create a line
              var strip = new H.geo.Strip();
              strip.pushPoint($scope.$parent.map.myMarker.getPosition());
              strip.pushPoint($scope.$parent.map.markers[member.$id].getPosition());
              $scope.$parent.map.lines[member.$id] = new H.map.Polyline(
                strip, {
                  style: {
                    lineWidth: 4
                  }
                }
              );
            console.debug("new Marker and lsner created >> ", member.$id)
          } // end if

          map.addObject($scope.$parent.map.markers[member.$id]);
          map.addObject($scope.$parent.map.lines[member.$id]);
        }; // end for members
      });
    } // end controller
});
