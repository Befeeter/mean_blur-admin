/**
* @author v.lugovsky
* created on 16.12.2015
*/
(function () {
  'use strict';

  var app = angular.module('BlurAdmin.pages.demo')
  .controller('demoCtrl', demoCtrl);

  /** @ngInject */

  function demoCtrl($scope, fileReader, $filter, $uibModal, $http, $location) {
    // First get the values from form

    // Defining parent data as object
    $scope.data = {};
    $scope.data.flag = false;
    $scope.data.switches = [true, true, false, true, true, false];


    $scope.submit = function(){

      $http.post("/admin/user", $scope.data)
      .success(function (data, status, headers){
        $scope.data.flag = true;
      })
      .error(function (data, status, header){

      });


    }

}

})();
