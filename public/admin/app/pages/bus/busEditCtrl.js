/**
* @author Mohd Belal
* created on 16.12.2015
*/
(function () {
  'use strict';

  var app = angular.module('BlurAdmin.pages.bus')
  .controller('busEditCtrl', busEditCtrl);

  /** @ngInject */

  function busEditCtrl($scope, fileReader, $filter, $uibModal, $http, $location, $stateParams) {
    // First get the values from form
    console.log("Inside Edit Controller");
    console.log("   --   "+ $stateParams.id);

    $scope.details = {};

    $scope.details.bus_id = $stateParams.id;

    //Now getting details of Bus by its id
    $http.post("/admin/bus/getById", $scope.details)
    .success(function (data, status, headers){
      console.log("Success");
      return false;

      $scope.data.buses = data;

      angular.forEach($scope.data.buses, function(arrayItem, index){
        $scope.smartTableData[index] = arrayItem;
      })

    })
    .error(function (data, status, header){
      console.log("Failed...........");
    });

    return false;
    // Defining parent data as object
    $scope.data = {};

  }

})();
