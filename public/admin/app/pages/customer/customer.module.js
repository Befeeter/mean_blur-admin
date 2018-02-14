/**
* @author v.lugovsky
* created on 16.12.2015
*/
(function () {
  'use strict';

  var app = angular.module('BlurAdmin.pages.customer', [])
  .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
    .state('active-customer',{
      url: '/active-customer',
      title: 'Active Customer',
      templateUrl: 'app/pages/customer/customerActiveList.html',
      controller: 'customerListActiveCtrl',
    })
    .state('inactive-customer',{
      url:'/inactive-customer',
      title: "Inactive Customer",
      templateUrl: 'app/pages/customer/customerInactiveList.html',
      controller: 'customerListInactiveCtrl',
    });
}

})();
