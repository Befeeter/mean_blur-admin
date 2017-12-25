/**
* @author v.lugovsky
* created on 16.12.2015
*/
(function () {
  'use strict';

  var app = angular.module('BlurAdmin.pages.bus', [])
  .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
    .state('bus', {
      url: '/bus',
      title: 'Bus',
      templateUrl: 'app/pages/bus/bus.html',
      controller: 'busCtrl',
    })
    .state('bus-list',{
      url: '/bus-list',
      title: 'Bus List',
      templateUrl: 'app/pages/bus/busList.html',
      controller: 'busListCtrl',
    })
    .state('bus-edit',{
      url:'/bus-edit/{id}',
      title: "Bus Edit",
      templateUrl: 'app/pages/bus/bus.html',
      controller: 'busEditCtrl',
    });
}

})();
