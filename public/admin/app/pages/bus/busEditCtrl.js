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

    $scope.data = {};

    $scope.data.bus_id = $stateParams.id;

    //Now getting details of Bus by its id
    $http.post("/admin/bus/getById", $scope.data)
    .success(function (data, status, headers){
        
      $scope.data = data;
    })
    .error(function (data, status, header){
      console.log("Failed to Fetch Bus Data");
    });
    
    
        // Now Updating the data in Mongo Db when forms submit
        $scope.submit = function () {

            // Adding Validation if required form data is empty
            if (!$scope.data.vehicle_name) {
                $scope.data.isValid = true;
            } else if (!$scope.data.seat_no) {
                $scope.data.isValid = true;
            } else if (!$scope.data.type) {
                $scope.data.isValid = true;
            } else if (!$scope.data.description) {
                $scope.data.isValid = true;
            } else {
                $scope.data.isValid = false;

                // Now Updating data in db
                $http.post("/admin/bus/update", $scope.data)
                        .success(function (data, status, headers) {
                            $scope.data.flag = true;
                        })
                        .error(function (data, status, header) {
                            $scope.data.isValid = true;
                        });

            }
        }
    
    
  }

})();
