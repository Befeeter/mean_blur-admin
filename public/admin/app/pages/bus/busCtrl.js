/**
* @author Mohd Belal
* created on 16.12.2015
*/
(function () {
  'use strict';

  var app = angular.module('BlurAdmin.pages.bus')
  .controller('busCtrl', busCtrl);

  /** @ngInject */

  function busCtrl($scope, fileReader, $filter, $uibModal, $http, $location) {
    // First get the values from form

    // Defining parent data as object
    $scope.data = {};
    $scope.data.flag = false;
    $scope.data.isValid = false;
    // $scope.data.picture = $filter('profilePicture')('Nasta');

    $scope.submit = function(){

      // Adding Validation if required form data is empty
      if(!$scope.data.vehicle_name){
        $scope.data.isValid = true;
      }else if (!$scope.data.seat_no) {
        $scope.data.isValid = true;
      }else if (!$scope.data.type) {
        $scope.data.isValid = true;
      }else if (!$scope.data.description) {
        $scope.data.isValid = true;
      }else{
        $scope.data.isValid = false;

        // Now saving data in db
        $http.post("/admin/bus", $scope.data)
        .success(function (data, status, headers){
          $scope.data.flag = true;
        })
        .error(function (data, status, header){
          $scope.data.isValid = true;
        });

      }
    }

  }

})();
