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
    function Piece (type, color){
      this.type = type;
      this.color = color;
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

    $scope.username1 = "DUCK_BOT - Level 4";
    $scope.username2 = "smmurphy33";

    $scope.avatar1 = "img/duckie.png";
    $scope.avatar2 = "img/ellie.png";

    $scope.color1 = "white";
    $scope.color2 = "black";

    $scope.appearance = 1;

    var selected_cell = -1;

    $scope.cell_clicked = function (n) {
      if (selected_cell == -1) {
        selected_cell = n;
      } else {
        var new_row = Math.floor(n/8);
        var new_col = n % 8;

        var old_row = Math.floor(selected_cell/8);
        var old_col = selected_cell % 8;

        if ($scope.board[new_row][new_col] != "") {
          if ($scope.board[new_row][new_col].color == "white"){
            $scope.capturedPieces1.push($scope.board[new_row][new_col]);
          } else {
            $scope.capturedPieces2.push($scope.board[new_row][new_col]);
          }
        }
        var orig = $scope.board[old_row][old_col];
        var dest = $scope.board[new_row][new_col];
        if ($scope.legalMove(orig, dest)) {
          $scope.board[new_row][new_col] = $scope.board[old_row][old_col];
          $scope.board[old_row][old_col] = "";
        } else {
          console.log("Illegal move");
        }

        selected_cell = -1;
      }
    };

    $scope.get_piece_image_icon = function(piece) {
      if (piece == "") {
        return "//:0";
      } else {
        return "img/" + piece.color + piece.type + $scope.appearance + ".png";
      }
    }

    $scope.notation = [["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"],
      ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"],
      ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"],
      ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"],
      ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"],
      ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"],
      ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"],
      ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"],
      ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", ""]];

    $scope.capturedPieces1 = [];
    $scope.capturedPieces2 = [];

    $scope.time1 = "5:00";
    $scope.time2 = "1:20:00";

    $scope.board = [
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
    ];

    // Black piece initial placement
    $scope.board[0][0] = new Piece("Rook", "black");
    $scope.board[0][1] = new Piece("Knight", "black");
    $scope.board[0][2] = new Piece("Bishop", "black");
    $scope.board[0][3] = new Piece("Queen", "black");
    $scope.board[0][4] = new Piece("King", "black");
    $scope.board[0][5] = new Piece("Bishop", "black");
    $scope.board[0][6] = new Piece("Knight", "black");
    $scope.board[0][7] = new Piece("Rook", "black");

    $scope.board[1][0] = new Piece("Pawn", "black");
    $scope.board[1][1] = new Piece("Pawn", "black");
    $scope.board[1][2] = new Piece("Pawn", "black");
    $scope.board[1][3] = new Piece("Pawn", "black");
    $scope.board[1][4] = new Piece("Pawn", "black");
    $scope.board[1][5] = new Piece("Pawn", "black");
    $scope.board[1][6] = new Piece("Pawn", "black");
    $scope.board[1][7] = new Piece("Pawn", "black");

    // White piece initial placement
    $scope.board[7][0] = new Piece("Rook", "white");
    $scope.board[7][1] = new Piece("Knight", "white");
    $scope.board[7][2] = new Piece("Bishop", "white");
    $scope.board[7][3] = new Piece("Queen", "white");
    $scope.board[7][4] = new Piece("King", "white");
    $scope.board[7][5] = new Piece("Bishop", "white");
    $scope.board[7][6] = new Piece("Knight", "white");
    $scope.board[7][7] = new Piece("Rook", "white");

    $scope.board[6][0] = new Piece("Pawn", "white");
    $scope.board[6][1] = new Piece("Pawn", "white");
    $scope.board[6][2] = new Piece("Pawn", "white");
    $scope.board[6][3] = new Piece("Pawn", "white");
    $scope.board[6][4] = new Piece("Pawn", "white");
    $scope.board[6][5] = new Piece("Pawn", "white");
    $scope.board[6][6] = new Piece("Pawn", "white");
    $scope.board[6][7] = new Piece("Pawn", "white");


    $scope.getBoard = function () {
      return [].concat.apply([], $scope.board);
    };

    $scope.legalMove = function(orig, dest) {
      // Normal piece movement
      if (orig.type == ("Pawn")) {
        console.log("clicked pawn");

      } else if (orig.type == ("Rook")) {
        console.log("clicked Rook");

      } else if (orig.type == ("Knight")) {
        console.log("clicked Knight");

      } else if (orig.type == ("Bishop")) {
        console.log("clicked Bishop");

      } else if (orig.type == ("Queen")) {
        console.log("clicked Queen");

      } else if (orig.type == ("King")) {
        console.log("clicked King");

      } else {
        console.log("ERROR: Type does not exist")
        console.log(new Error().stack);
      }


      // Check move into check

      // legal move
      return true;
      //return false;
    }

  });
