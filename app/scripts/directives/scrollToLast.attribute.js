angular.module('onTimeApp').directive('scrollToLast', ['$location', '$anchorScroll',
  function($location, $anchorScroll) {
    function linkFn(scope, element, attrs) {

      $location.hash('chat_bottom_anchor');
      $anchorScroll();
    }
    return {
      restrict: 'A',
      scope: {

      },
      link: linkFn
    };

  }
]);
