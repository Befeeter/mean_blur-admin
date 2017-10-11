(function () {
  'use strict';

  angular.module('BlurAdmin.pages.demo', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
  	$stateProvider
  		.state('demo', {
  			url: '/demo',
  			templateUrl: 'app/pages/demo/demo.html',
  			title: ' This is for Demo ',
  			sidebarMeta: {
  				icon: 'ion-android-home',
  				order: 800,
  			},

  		});

  }

})();