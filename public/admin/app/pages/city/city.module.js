/**
* @author v.lugovsky
* created on 16.12.2015
*/
(function () {
  'use strict';

  var app = angular.module('BlurAdmin.pages.city', [])
  .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
    .state('city', {
      url: '/city',
      title: 'city',
      templateUrl: 'app/pages/city/city.html',
      controller: 'cityCtrl',
    })
    .state('city-list',{
      url: '/city-list',
      title: 'city List',
      templateUrl: 'app/pages/city/cityList.html',
      controller: 'cityListCtrl',
    })
    .state('city-edit',{
      url:'/city-edit/{id}',
      title: "city Edit",
      templateUrl: 'app/pages/city/city.html',
      controller: 'cityEditCtrl',
    });
}

})();
