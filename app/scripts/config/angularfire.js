(function() {
  'use strict';
  angular.module('firebase.auth', ['firebase', 'firebase.ref'])
    .factory('Auth', function($firebaseAuth, FireRef) {
      return $firebaseAuth(FireRef);
    });
})();


angular.module('firebase.config', [])
  .constant('FBURL', 'https://luminous-torch-8131.firebaseio.com')
  .constant('SIMPLE_LOGIN_PROVIDERS', ['password'])
  .constant('loginRedirectPath', '/login');

  angular.module('firebase.ref', ['firebase', 'firebase.config'])
    .factory('FireRef', ['$window', 'FBURL', function($window, FBURL) {
      'use strict';
      return new $window.Firebase(FBURL);

    }]).factory('RoomMetaRef', ['FireRef', function(FireRef) {
      'use strict';
      return FireRef.child('room-metadata');

      // }]).factory('PrvtRoomRef', ['FireRef', function(FireRef) {
      //   'use strict';
      //   return FireRef.child('room-private-metadata');

    }]).factory('RoomMsgsRef', ['FireRef', function(FireRef) {
      'use strict';
      return FireRef.child('room-messages');

    }]).factory('ModeratorsRef', ['FireRef', function(FireRef) {
      'use strict';
      return FireRef.child('moderators');

    }]).factory('SuspensionsRef', ['FireRef', function(FireRef) {
      'use strict';
      return FireRef.child('suspensions');

    }]).factory('OnlineUsersRef', ['FireRef', function(FireRef) {
      'use strict';
      return FireRef.child('user-names-online');
    }]).factory('RoomUsersRef', ['FireRef', function(FireRef) {
      'use strict';
      return FireRef.child('room-users');
    }]).factory('UsersRef', ['FireRef', function(FireRef) {
      'use strict';
      return FireRef.child('users');
  }]);
