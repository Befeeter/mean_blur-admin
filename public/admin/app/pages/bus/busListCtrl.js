/**
* @author Mohd Belal
* created on 16.12.2015
*/
(function () {
  'use strict';

  var app = angular.module('BlurAdmin.pages.bus')
  .controller('busListCtrl', busListCtrl);

  /** @ngInject */

  function busListCtrl($scope, fileReader, $filter, $uibModal, $http, $location) {
    // First get the values from form

    // Defining parent data as object
    $scope.data = {};
    $scope.smartTableData = [];
    // Getting data from db
    $http.get("/admin/bus")
    .success(function (data, status, headers){
      $scope.data.buses = data;

      angular.forEach($scope.data.buses, function(arrayItem, index){
        $scope.smartTableData[index] = arrayItem;
      })

    })
    .error(function (data, status, header){
      console.log("Failed...........");
    });

  //   // Handle Post Data
  //   $http.post('/', function (req, res){
  //     console.log("Inside Post");
  //     console.log(req);
  // return false;
  //   });




    $scope.removeUser = function(index) {
      $scope.users.splice(index, 1);
    };

    $scope.addUser = function() {
      $scope.inserted = {
        id: $scope.users.length+1,
        name: '',
        status: null,
        group: null
      };
      $scope.users.push($scope.inserted);
    };

  }



})();
