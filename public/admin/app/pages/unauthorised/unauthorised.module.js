/**
* @author v.lugovsky
* created on 16.12.2015
*/
(function () {
  'use strict';

  var app = angular.module('BlurAdmin.pages.unauthorised', [])
  .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
    .state('unauthorised', {
      url: '/unauthorised',
      title: 'Unauthorised',
      templateUrl: 'app/pages/unauthorised/unauthorised.html',
      controller: 'unauthorisedCtrl',
    });
  }

})();
