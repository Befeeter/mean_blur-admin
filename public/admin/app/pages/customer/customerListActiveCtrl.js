/**
* @author Mohd Belal
* created on 16.12.2017
*/
(function () {
  'use strict';

  var app = angular.module('BlurAdmin.pages.customer')
  .controller('customerListActiveCtrl', customerListActiveCtrl);

  /** @ngInject */

  function customerListActiveCtrl($scope, fileReader, $filter, $uibModal, $http, $location, toastr, $window) {
    // First get the values from form

    // Defining parent data as object
    $scope.data = {};
    $scope.smartTableData = [];
    // Getting data from db
    $http.get("/admin/customer/getActiveCustomer")
    .success(function (data, status, headers){
      $scope.data.customers = data;
      angular.forEach($scope.data.customers, function(arrayItem, index){
        $scope.smartTableData[index] = arrayItem;
      })

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
        toastr.success('Customer DeActivated', 'Success', {
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

  }
})();
