/**
* @author Mohd Belal
* created on 16.12.2015
*/
(function () {
  'use strict';

  var app = angular.module('BlurAdmin.pages.city')
  .controller('cityCtrl', cityCtrl);

  /** @ngInject */

  function cityCtrl($scope, fileReader, $filter, $uibModal, $http, $location) {
    // First get the values from form

    // Defining parent data as object
    $scope.data = {};
    $scope.data.flag = false;
    $scope.data.isValid = false;
    // $scope.data.picture = $filter('profilePicture')('Nasta');

    $scope.submit = function(){

      // Adding Validation if required form data is empty
      if(!$scope.data.city_name){
        $scope.data.isValid = true;
      }else if (!$scope.data.state) {
        $scope.data.isValid = true;
      }else if (!$scope.data.status) {
        $scope.data.isValid = true;
      }else{
        $scope.data.isValid = false;

        // Now saving data in db
        $http.post("/admin/city", $scope.data)
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
