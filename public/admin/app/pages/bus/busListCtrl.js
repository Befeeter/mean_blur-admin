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
    // Getting data from db
    $http.get("/admin/bus/getAll")
    .success(function (data, status, headers){
      $scope.data.buses = data;
      console.log("Done...........");
      console.log($scope.data);


      console.log("Before Loop");
      angular.forEach($scope.data.buses, function(arrayItem, index){
        console.log(arrayItem);
        $scope.users[index] = arrayItem;
        console.log(index);
      })

      console.log("After Array");
      console.log($scope.users);

      return false;
    })
    .error(function (data, status, header){
      console.log("Failed...........");
      // $scope.data.isValid = true;
      // return false;
    });
    return false;

    //   {
    //     "id": 1,
    //     "name": "Esther Vang",
    //     "status": 4,
    //     "group": 3
    //   },
    //   {
    //     "id": 2,
    //     "name": "Leah Freeman",
    //     "status": 3,
    //     "group": 1
    //   },
    //   {
    //     "id": 3,
    //     "name": "Mathews Simpson",
    //     "status": 3,
    //     "group": 2
    //   },
    //   {
    //     "id": 4,
    //     "name": "Buckley Hopkins",
    //     "group": 4
    //   },
    //   {
    //     "id": 5,
    //     "name": "Buckley Schwartz",
    //     "status": 1,
    //     "group": 1
    //   },
    //   {
    //     "id": 6,
    //     "name": "Mathews Hopkins",
    //     "status": 4,
    //     "group": 2
    //   },
    //   {
    //     "id": 7,
    //     "name": "Leah Vang",
    //     "status": 4,
    //     "group": 1
    //   },
    //
    // ];
    $scope.statuses = [
      {value: 1, text: 'Good'},
      {value: 2, text: 'Awesome'},
      {value: 3, text: 'Excellent'},
    ];

    $scope.groups = [
      {id: 1, text: 'user'},
      {id: 2, text: 'customer'},
      {id: 3, text: 'vip'},
      {id: 4, text: 'admin'}
    ];

    $scope.showGroup = function(user) {
      if(user.group && $scope.groups.length) {
        var selected = $filter('filter')($scope.groups, {id: user.group});
        return selected.length ? selected[0].text : 'Not set';
      } else return 'Not set'
    };

    $scope.showStatus = function(user) {
      var selected = [];
      if(user.status) {
        selected = $filter('filter')($scope.statuses, {value: user.status});
      }
      return selected.length ? selected[0].text : 'Not set';
    };


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
