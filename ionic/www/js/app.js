// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
  .config(function($stateProvider, $urlRouterProvider){
    $stateProvider
      .state('view', {
        url: "/view",
        abstract: true,
        templateUrl: "templates/view.html"
      })
      .state('view.start', {
        url: "/start",
        views: {
          'start-view': {
            templateUrl: "templates/start.html",
            controller: "startCtrl"
          }
        }
      })
      .state('view.vert', {
        url: "/vert",
        views: {
          'vert-view': {
            templateUrl: "templates/vert.html",
            controller: "vertCtrl"
          }
        }
      });
    $urlRouterProvider.otherwise("/view/start");
  })

  .controller('startCtrl', function($scope, $state){
    $scope.singlePlayer = function(){
      $state.go('view.vert');
    };
  })


  .controller('vertCtrl', function($scope, $state) {
    function Piece (type, row, col){
      this.type = type;
      this.row = row;
      this.col = col;
      this.isCaptured = false;

      if(this.type == "Pawn"){
        this.value = 1;
      }
      else if(this.type == "Knight"){
        this.value = 3;
        this.notation = "N";
      }
      else if(this.type == "Bishop"){
        this.value = 3.1;
        this.notation = "B";
      }
      else if(this.type == "Rook"){
        this.value = 5;
        this.notation = "R";
      }
      else if(this.type == "Queen"){
        this.value = 9;
        this.notation = "Q";
      }
      else{
        this.value = 10000;
        this.notation = "K";
      }
    }

    $scope.pawn = new Piece("Pawn", 1, 'a');
    $scope.knight = new Piece("Knight", 1, 'a');
    $scope.bishop = new Piece("Bishop", 1, 'a');
    $scope.rook = new Piece("Rook", 1, 'a');
    $scope.queen = new Piece("Queen", 1, 'a');
    $scope.king = new Piece("King", 1, 'a');

    $scope.username1 = "DUCK_BOT - Level 4";
    $scope.username2 = "smmurphy33";

    $scope.avatar1 = "img/duckie.png";
    $scope.avatar2 = "img/ellie.png";

    $scope.color1 = "white";
    $scope.color2 = "black";

    $scope.appearance = 1;

    $scope.notation = [["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"],
      ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"],
      ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"],
      ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"],
      ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"],
      ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"],
      ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"],
      ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"],
      ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", ""]];

    $scope.capturedPieces1 = [$scope.pawn, $scope.pawn, $scope.pawn, $scope.pawn, $scope.pawn, $scope.pawn,
      $scope.pawn, $scope.pawn, $scope.knight, $scope.knight, $scope.bishop, $scope.bishop,
      $scope.rook, $scope.rook, $scope.queen, $scope.king];
    $scope.capturedPieces2 = [$scope.pawn, $scope.pawn, $scope.knight,
      $scope.bishop, $scope.rook, $scope.queen, $scope.king];

    $scope.time1 = "5:00";
    $scope.time2 = "1:20:00";
  })
