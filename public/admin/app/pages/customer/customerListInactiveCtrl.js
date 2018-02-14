/**
* @author Mohd Belal
* created on 16.12.2017
*/
(function () {
  'use strict';

  var app = angular.module('BlurAdmin.pages.customer')
  .controller('customerListInactiveCtrl', customerListInactiveCtrl);

  /** @ngInject */

  function customerListInactiveCtrl($scope, fileReader, $filter, $uibModal, $http, $location, toastr, $window, $timeout) {
    // First get the values from form

    // Defining parent data as object
    $scope.data = {};
    // $scope.smartTableData = [];
    $scope.smartTablePageSize = 5;
    var smartTableData_temp = new Array();
    // Getting data from db
    $http.get("/admin/customer/getInActiveCustomer")
    .success(function (data, status, headers){
      $scope.data.customers = data;
      angular.forEach($scope.data.customers, function(arrayItem, index){
        var temp_arr = {};
        temp_arr.id = parseInt(index) + 1;
        temp_arr.name = arrayItem['name'];
        temp_arr.mobile = arrayItem['mobile'];
        temp_arr.email = arrayItem['email'];
        temp_arr.status = arrayItem['status'];
        // // smartTableData_temp.push(temp_arr);
        smartTableData_temp[index] = temp_arr;
          // $scope.smartTableData[index] = arrayItem;
      })

      // $scope.smartTableData = data;
      // $scope.smartTableData = smartTableData_temp;
      // console.log($scope.smartTableData);
      $timeout(function () {
          //$scope.smartTableData = smartTableData_temp;

      }, 1000);


    })
    .error(function (data, status, header){
      console.log("Failed...........");
      //Handling 403 response
      if(status == 403){
        var baseUrl = ($location.protocol()+'://'+$location.host()+':'+$location.port()+'/admin/#/unauthorised');
        $window.open(baseUrl,"_self");
      }
    });

    $scope.changestatus = function(_id,status, customer_selector_id){

      var selector_id = customer_selector_id + 1;
      $scope.update_data = {};
      $scope.update_data._id = _id;
      $scope.update_data.status = status;

      $http.post("/admin/customer/update", $scope.update_data)
      .success(function (data, status, headers){

        angular.element("#customer_row_"+selector_id).hide();

        toastr.success('Customer Activated', 'Success', {
          "autoDismiss": false,
          "positionClass": "toast-top-center",
          "type": "success",
          "timeOut": "5000",
          "extendedTimeOut": "2000",
          "allowHtml": false,
          "closeButton": false,
          "tapToDismiss": true,
          "progressBar": false,
          "newestOnTop": true,
          "maxOpened": 0,
          "preventDuplicates": false,
          "preventOpenDuplicates": false
        });

      })
      .error(function (data, status, header){
        console.log("Failed...........");
        //Handling 403 response
        if(status == 403){
          var baseUrl = ($location.protocol()+'://'+$location.host()+':'+$location.port()+'/admin/#/unauthorised');
          $window.open(baseUrl,"_self");
        }
      });

    }

    $scope.smartTableData = [

      {
        "id": 50,
        "name": "Rebekah",
        "mobile": 98798798798,
        "email": "rebekahgross@comtours.com",
      },
      {
        "id": 51,
        "name": "Rebekah",
        "mobile": 98798798798,
        "email": "earlinewoodward@comtours.com",
      },
      {
        "id": 52,
        "name": "Rebekah",
        "mobile": 98798798798,
        "email": "moranjohns@comtours.com",
      },
      {
        "id": 53,
        "name": "Rebekah",
        "mobile": 98798798798,
        "email": "nanettecooke@comtours.com",
      },
      {
        "id": 54,
        "name": "Rebekah",
        "mobile": 98798798798,
        "email": "daltonhendricks@comtours.com",
      },
      {
        "id": 55,
        "name": "Rebekah",
        "mobile": 98798798798,
        "email": "bennettpena@comtours.com",
      },
      // {
      //   "id": 56,
      //   "firstName": "Kellie",
      //   "lastName": "Horton",
      //   "username": "@Weiss",
      //   "email": "kellieweiss@comtours.com",
      // },
      // {
      //   "id": 57,
      //   "firstName": "Hobbs",
      //   "lastName": "Talley",
      //   "username": "@Sanford",
      //   "email": "hobbssanford@comtours.com",
      // }
    ];







     // console.log($scope.smartTableData);

  }
})();
