/**
* @author v.lugovsky
* created on 16.12.2015
*/
(function () {
  'use strict';

  var app = angular.module('BlurAdmin.pages.demo')
  .controller('demoCtrl', demoCtrl);

  /** @ngInject */

  function demoCtrl($scope, fileReader, $filter, $uibModal, $http) {
    // First get the values from form

    // Defining parent data as object
    $scope.data = {};
    $scope.data.switches = [true, true, false, true, true, false];


    $scope.submit = function(){
      //Getting Post data
      console.log($scope.data);

      // Getting details form Server
      // $http.post("/api/users/current", $scope.data,  function(err, data){
      //   console.log("http request");
      //   console.log("Err :" + err);
      //   console.log("Data :" + data);
      // });
      //


      //Now saving data


      return false;
    }

    // $scope.picture = $filter('profilePicture')('Nasta');

    // $scope.removePicture = function () {
    //   $scope.picture = $filter('appImage')('theme/no-photo.png');
    //   $scope.noPicture = true;
    // };
    //
    // $scope.uploadPicture = function () {
    //   var fileInput = document.getElementById('uploadFile');
    //   fileInput.click();

    // };


    // $scope.getFile = function () {
    //   fileReader.readAsDataUrl($scope.file, $scope)
    //       .then(function (result) {
    //         $scope.picture = result;
    //       // console.log("Outside onloadend");
    //       });
    //
    //       // fileReader.onloadend = function (e){
    //       //   $scope.picture = fileReader.result;
    //       //   console.log("Inside Loadend");
    //       //   console.log(fileReader.result);
    //       //
    //       // }
    // };


  }

})();
