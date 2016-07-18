'use strict';

/**
 * @ngdoc overview
 * @name onTimeApp
 * @description
 * # onTimeApp
 *
 * Main module of the application.
 */
angular.module('onTimeApp', [
  'firebase',
  'firebase.ref',
  'firebase.auth',
  'onsen',
  'ngAnimate',
  'ngAria',
  'ngCookies',
  'ngMessages',
  'ngResource',
  'ngRoute',
  'ngSanitize',
  // 'ngTouch',
  'ngCordova',
  'ngMaterial',
  'checklist-model'
]);
//.run(function(Account) {
  // if (window.cordova) {
  //   cordova.plugins.backgroundMode.enable();
  // }
//});
