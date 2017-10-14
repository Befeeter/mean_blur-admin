/**
 * @author v.lugovsky
 * created on 15.12.2015
 */
(function () {
  'use strict';
console.log("Inside theme controller");
  angular.module('BlurAdmin.theme', [
      'toastr',
      'chart.js',
      'angular-chartist',
      'angular.morris-chart',
      'textAngular',
      'BlurAdmin.theme.components',
      'BlurAdmin.theme.inputs'
  ]);

})();
