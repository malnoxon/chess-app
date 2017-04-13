// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'firebase'])

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      if (window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }

    });
  })

  .factory("Auth", ['$firebaseAuth',
    function ($firebaseAuth) {
      return $firebaseAuth();
    }
  ])

  .config(function ($stateProvider, $urlRouterProvider) {
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

  .controller('startCtrl', function ($scope, $state, Auth) {

    //TODO: save user login token in local data (automatic login)

    if (firebase.auth().currentUser) {
      $scope.currentState = "Logout"
    } else {
      $scope.currentState = "login"
    }

    $scope.login_popup = function () {
      $scope.popup_close(); //reset
      if (!firebase.auth().currentUser) {
        document.getElementById('login_popup').style.display = 'block';
      } else {
        document.getElementById('logged_in_popup').style.display = 'block';
      }
    }
    $scope.signup_popup = function () {
      $scope.popup_close();
      document.getElementById('signup_popup').style.display = 'block';
    }
    $scope.popup_close = function () {
      document.getElementById('login_popup').style.display = 'none';
      document.getElementById('logged_in_popup').style.display = 'none';
      document.getElementById('signup_popup').style.display = 'none';
    }


    // for testing
    $scope.username = "test_user@yahoo.com";
    $scope.password = "password";

    $scope.login = function () {

      console.log("clicked login button")
      Auth.$signInWithEmailAndPassword($scope.username, $scope.password)
        .then(function (firebaseUser) {
          console.log("User logged in!!! Userid:" + firebaseUser.uid);
          alert("Successfully signed in");
          $scope.currentState = "Logout"
          $scope.userName = firebase.auth().currentUser.email;
          $scope.popup_close()
        })
        .catch(function (error) {
          console.log("Sign in failure!!! " + $scope.username + " " + error)
        })
    }

    $scope.logout = function () {
      firebase.auth().signOut()
        .then(function () {
          console.log("user signed out");
          $scope.currentState = "Login";
          $scope.$apply();
          $scope.popup_close();
        })
        .catch(function (error) {
          console.log("user is not signed out")
          alert("Signout failed " + error)
        });
    }

    $scope.signup = function () {
      firebase.auth().createUserWithEmailAndPassword($scope.username, $scope.password)
        .then(function () {
          console.log("successful signout")
          $scope.currentState = "Logout";
          $scope.userName = firebase.auth().currentUser.email;
          $scope.$apply();
          $scope.popup_close();
        })
        .catch(function (error) {
          alert("create user failed " + error);
        })
    };

    $scope.singlePlayer = function () {
      $state.go('view.vert');
    };
  })

  .controller('vertCtrl', function ($scope, $state) {
    function Piece(type, color) {
      this.type = type;
      this.color = color;
      this.isCaptured = false;

      if (this.type == "Pawn") {
        this.value = 1;
      }
      else if (this.type == "Knight") {
        this.value = 3;
        this.notation = "N";
      }
      else if (this.type == "Bishop") {
        this.value = 3.1;
        this.notation = "B";
      }
      else if (this.type == "Rook") {
        this.value = 5;
        this.notation = "R";
      }
      else if (this.type == "Queen") {
        this.value = 9;
        this.notation = "Q";
      }
      else {
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
        var new_row = Math.floor(n / 8);
        var new_col = n % 8;

        var old_row = Math.floor(selected_cell / 8);
        var old_col = selected_cell % 8;

        // make inputs for legalMove function
        var orig = {
          "piece": $scope.board[old_row][old_col],
          "row": old_row,
          "col": old_col
        };
        var dest = {
          "piece": $scope.board[new_row][new_col], // need peice to know if null ("")
          "row": new_row,
          "col": new_col
        };

        if ($scope.legalMove(orig, dest)) {
          if ($scope.board[new_row][new_col] != "") {
            if ($scope.board[new_row][new_col].color == "white") {
              $scope.capturedPieces1.push($scope.board[new_row][new_col]);
            } else {
              $scope.capturedPieces2.push($scope.board[new_row][new_col]);
            }
          }

          $scope.board[new_row][new_col] = $scope.board[old_row][old_col];
          $scope.board[old_row][old_col] = "";

        } else {
          console.log("Illegal move");
        }

        selected_cell = -1;
      }
    };

    $scope.get_piece_image_icon = function (piece) {
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

    /**
     *
     * @param orig - dictionary of piece, row, and col of piece you want to move (keys are piece, row, col)
     * @param dest - dictionary of piece, row, and col of where you want to move (keys are piece, row, col)
     * @returns the move to be entered in Long Algebraic Notation
     * NOTE: this function is for communicating with the AI, some modifications will be needed for the displayed notation
     */
    $scope.moveToLAN = function (orig, dest, queened_to) {
      var move = "";
      var piece_symbols = {"Knight": "K", "Bishop": "B", "Rook": "R", "Queen": "Q", "King": "K", "Pawn": ""};
      var col_letters = {0: "a", 1: "b", 2: "c", 3: "d", 4: "e", 5: "f", 6: "g", 7: "h"};
      // var connecting_char = "-";
      // if(dest.piece != null) {
      //   connecting_char = "x";
      // }
      move.concat(piece_symbols[orig.piece.type], (orig.row + 1).toString(), col_letters[orig.col], piece_symbols[dest.piece.type], (dest.row + 1).toString(), col_letters[dest.col]);

      if (queened_to != null) {
        move.concat("=", piece_symbols[queened_to.type]);
      }

      return move;
    }

    /**
     *
     * @param orig - dictionary of piece, row, and col of piece you want to move (keys are piece, row, col)
     * @param dest - dictionary of piece, row, and col of where you want to move (keys are piece, row, col)
     * @returns true if move is valid, false if move is not valid
     */
    $scope.legalMove = function (orig, dest) {
      // Normal piece movement:

      // MOVE PAWN
      // TODO: also need en passant
      if (orig.piece.type == ("Pawn")) {

        if (orig.piece.color == "black") {
          if ((dest.row == orig.row + 1) || // can only move forward by 1
            (orig.row == 1 && dest.row == orig.row + 2)) { // unless this is the first move, then can move forward by 2
            if ((dest.col == orig.col && dest.piece.type == null) ||  // can move directly forward if there is no piece there
              ((dest.col == orig.col + 1 || dest.col == orig.col - 1) && dest.piece.color == "white")) { // can move diagonally forward if taking
              return true;
            }
          }
        } else if (orig.piece.color == "white") { // same rules as black but flipped
          if ((dest.row == orig.row - 1) || // can only move forward by 1
            (orig.row == 6 && dest.row == orig.row - 2)) { // unless this is the first move, then can move forward by 2
            if ((dest.col == orig.col && dest.piece.type == null) ||  // can move directly forward if there is no piece there
              ((dest.col == orig.col + 1 || dest.col == orig.col - 1) && dest.piece.color == "black")) { // can move diagonally forward if taking
              return true;
            }
          }
        }

        // MOVE ROOK
      } else if (orig.piece.type == ("Rook")) {
        if (dest.piece.color != orig.piece.color) { // cannot move to destination occupied by self
          // Moving in a row:
          if (orig.row == dest.row) {
            // Check if there is a free path between orig and dest in row
            var endIndex = Math.max(orig.col, dest.col);
            var beginIndex = Math.min(orig.col, dest.col);
            for (var i = 1; i < endIndex - beginIndex; i++) {
              if ($scope.board[orig.row][beginIndex + i] != "") {
                return false; // invalid move -- something in path
              }
            }

            // found no fault with row move
            return true;

            // Moving in a column
          } else if (orig.col == dest.col) {
            var endIndex = Math.max(orig.row, dest.row);
            var beginIndex = Math.min(orig.row, dest.row);
            for (var i = 1; i < endIndex - beginIndex; i++) {
              if ($scope.board[beginIndex + i][orig.col] != "") {
                return false; // invalid move -- something in path
              }
            }
            // found no fault with column move
            return true;
          }

        }

        // MOVE KNIGHT
      } else if (orig.piece.type == ("Knight")) {
        if (dest.piece.color != orig.piece.color) { // cannot move to destination occupied by self
          var columnDiff = Math.abs(dest.col - orig.col);
          var rowDiff = Math.abs(dest.row - orig.row);
          if (columnDiff == 1 && rowDiff == 2) {
            return true;
          } else if (columnDiff == 2 && rowDiff == 1) {
            return true;
          }

        }

        // MOVE BISHOP
      } else if (orig.piece.type == ("Bishop")) {
        if (dest.piece.color != orig.piece.color) { // cannot move to destination occupied by self
          var columnDiff = Math.abs(dest.col - orig.col);
          var rowDiff = Math.abs(dest.row - orig.row);
          if (columnDiff != rowDiff) { // ie. moving diagonal
            return false; // not valid move
          }
          // check to see if path exists between orig and dest

          // var for up or down direction. should = -1 for up, 1 for down
          var UDdirection = Math.abs(dest.row - orig.row) / (dest.row - orig.row);
          // var for right or left direction. should = 1 for right, -1 for left
          var RLdirection = Math.abs(dest.col - orig.col) / (dest.col - orig.col);
          for (var i = 1; i < rowDiff; i++) {
            //debugging: console.log($scope.board[orig.row + i*UDdirection][orig.col + i*RLdirection])
            if ($scope.board[orig.row + i * UDdirection][orig.col + i * RLdirection] != "") {
              return false;
            }
          }
          // found no fault with move, return true;
          return true;
        }


        // MOVE QUEEN
      } else if (orig.piece.type == ("Queen")) {
        // Should be same value as legal move of rook || bishop
        // so just do legalMove(if this was a rook) || legalMove(if this was a bishop)
        var rook_orig = {
          "piece": new Piece("Rook", orig.piece.color),
          "row": orig.row,
          "col": orig.col
        };
        var bish_orig = {
          "piece": new Piece("Bishop", orig.piece.color),
          "row": orig.row,
          "col": orig.col
        };
        return ($scope.legalMove(rook_orig, dest) || $scope.legalMove(bish_orig, dest));


        // MOVE KING
      } else if (orig.piece.type == ("King")) {
        console.log("clicked King");
        if (dest.piece.color != orig.piece.color) { // cannot move to destination occupied by self
          var columnDiff = Math.abs(dest.col - orig.col);
          var rowDiff = Math.abs(dest.row - orig.row);

          if (columnDiff <= 1 && rowDiff <= 1) {
            return true;
          }
        }

        //TODO: NEED TO HANDLE CASTLING RULES

      } else {
        console.log("ERROR: Type does not exist")
        console.log(new Error().stack);
      }

      //TODO: Check if player is moving into check

      // default return false
      return false;
    }

  });
