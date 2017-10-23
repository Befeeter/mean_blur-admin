/**
* @author v.lugovsky
* created on 16.12.2015
*/
(function () {
  'use strict';

  var app = angular.module('BlurAdmin.pages.demo', [])
  .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
    .state('demo', {
      url: '/demo',
      title: 'Demo',
      templateUrl: 'app/pages/demo/demo.html',
      controller: 'demoCtrl',
    });
  }

})();
