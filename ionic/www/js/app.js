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

    $scope.user;
    firebase.auth().onAuthStateChanged(function(user) {
      if(user) {
        $scope.user = user;
        $scope.currentState = "Logout"
      } else {
        $scope.currentState = "login"
        $scope.login_popup();
      }

    });

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


    var startup = true;
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        $scope.currentState = "Logout"
        $scope.userName = firebase.auth().currentUser.email;
        $scope.$apply();
      } else {
        if (startup) {
          //$scope.login_popup();
        }
        $scope.currentState = "Login"
        $scope.$apply();
      }
      startup = false;
      startup = false;
    });

    // for testing
    $scope.username = "test_user@yahoo.com";
    $scope.password = "password";

    $scope.login = function () {

      console.log("clicked login button")
      document.getElementById('loader').style.display = 'block';
      Auth.$signInWithEmailAndPassword($scope.username, $scope.password)
        .then(function (firebaseUser) {
          console.log("User logged in!!! Userid:" + firebaseUser.uid);
          $scope.currentState = "Logout"
          $scope.userName = firebase.auth().currentUser.email;
          $scope.popup_close()
        })
        .catch(function (error) {
          document.getElementById('error_message').innerHTML= error;
          setTimeout(function() {document.getElementById('error_message').innerHTML='';},5000);
        })
        .finally(function() {
          document.getElementById('loader').style.display = 'none';
        })
    }

    // $scope.google_login = function() {
    //   document.getElementById('loader').style.display = 'block';
    //   var provider = new firebase.auth.GoogleAuthProvider();
    //   firebase.auth().signInWithRedirect(provider);
    //   $scope.currentState="Logout"
    //   firebase.auth().getRedirectResult().then(function(result) {
    //     if (result.credential) {
    //       var token = result.credential.accessToken;
    //     }
    //   }).catch(function(error) {
    //     console.log(error)
    //   }).finally(function() {
    //     document.getElementById('loader').style.display = 'none';
    //   })
    //
    // }


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

          // Add user to user database
          var user = firebase.auth().currentUser;
          firebase.database().ref('users/' + user.uid).set({
            username: user.displayName,
            email: user.email
          })

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

    //$scope.color1 = "black";
    //$scope.color2 = "white";

    $scope.notation = [];
    $scope.toMove = "white"

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

    $scope.select_colors = [
      {value: 'black', name: "black"},
      {value: 'white', name: "white"}];

    $scope.select_skill = [
      {value: 5, name: "5"},
      {value: 10, name: "10"},
      {value: 15, name: "15"},
      {value: 20, name: "20"}];

    $scope.opponent = {username: $scope.username1, avatar: $scope.avatar1, color: "", captured: $scope.capturedPieces1};
    $scope.player = {username: $scope.username2, avatar: $scope.avatar2, color: "", captured: $scope.capturedPieces2};

    $scope.appearance = 1;

    $scope.stockFish_popup = function () {
      if($scope.user) {
        //clear single_player_Game database
          firebase.database().ref('users/' + $scope.user.uid + "/single_player_Game").set(null);

      }
      document.getElementById('stockFish_popup').style.display = 'block';
    }

    $scope.cont_game_popup = function() {
      document.getElementById('cont_game_popup').style.display = 'block';
    }

    $scope.setStockFish = function() {
      $scope.player.color = $scope.selectedColor;
      if ($scope.player.color == 'white') {
        $scope.opponent.color = "black";
      } else {
        $scope.opponent.color = "white";
      }
      stockfish.postMessage('setoption name Skill Level value ' + $scope.selectedSkill);
    }

    $scope.popup_close = function () {
      document.getElementById('stockFish_popup').style.display = 'none';
      document.getElementById('cont_game_popup').style.display = 'none';
      $scope.setStockFish();


      if($scope.opponent.color == "white") {
        $scope.computerMove();
      }
    }


    //Check if user already has a game in progress
    var load_game = null;
    firebase.auth().onAuthStateChanged(function (user) {
      $scope.user = user
      if ($scope.user) {
        console.log("user is valid for database access");

        firebase.database().ref('users/' + $scope.user.uid).once("value")
          .then(function (snapshot) {
            try {
              load_game = snapshot.val().single_player_Game;
              if (load_game) {
                $scope.cont_game_popup();
              } else {
                $scope.stockFish_popup();
              }
            } catch (error) {
              console.log(error);
            }
            if (!load_game) {
              $scope.stockFish_popup();
            }
          })
      } else {
        $scope.stockFish_popup();
      }
    });


    $scope.load_game = function() {
      document.getElementById('cont_game_popup').style.display = 'none';
      var load_notation = load_game.notation;
      $scope.player.color = load_game.color;

      if ($scope.player.color == "white") {
        $scope.opponent.color = "black";
      } else if ($scope.player.color == "black"){
        $scope.opponent.color = "white"
      }

      for (var i=0; i < load_notation.length; i++) {
        $scope.UCItoMove(load_notation[i][0], "white");
        $scope.toMove = "black"
        if (load_notation[i][1]) {
          $scope.UCItoMove(load_notation[i][1], "black");
          $scope.toMove = "white"
        }
      }
      $scope.notation = load_notation;

      if ($scope.toMove == $scope.opponent.color) {
        $scope.computerMove();
      }
    };


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

        //console.log("toMove = " + $scope.toMove + " " + orig + " " + dest);

        if ($scope.legalMove(orig, dest, $scope.board, true) && $scope.toMove == $scope.player.color) {
          if ($scope.board[new_row][new_col] != "") {
            $scope.player.captured.push($scope.board[new_row][new_col]);
          }
          $scope.board[new_row][new_col] = $scope.board[old_row][old_col];
          $scope.board[old_row][old_col] = "";

          // player notation
          if ($scope.player.color == "white") {
            //TODO: queening/castling/enpassant
            $scope.notation.push([$scope.moveToUCINotation(orig, dest, null), '']);
            //console.log($scope.notation);
          } else {
            $scope.notation[$scope.notation.length - 1][1] = $scope.moveToUCINotation(orig, dest, null);
            //console.log($scope.notation);
          }

          $scope.toMove = $scope.opponent.color;

          $scope.computerMove();

          if ($scope.user) {
            console.log("updating database");
            firebase.database().ref('users/' + $scope.user.uid + "/single_player_Game").set({color: $scope.player.color, notation: $scope.notation});
          }
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

    function place_peices() {
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
    }
    place_peices();

    $scope.getBoard = function () {
      return [].concat.apply([], $scope.board);
    };

    /**
     * @param orig - dictionary of piece, row, and col of piece you want to move (keys are piece, row, col)
     * @param dest - dictionary of piece, row, and col of where you want to move (keys are piece, row, col)
     * @returns string move to be entered in Long Algebraic Notation
     * NOTE: this function is for communicating with the AI, some modifications will be needed for the displayed notation
     * http://wbec-ridderkerk.nl/html/UCIProtocol.html
     */
    $scope.moveToUCINotation = function (orig, dest, queened_to) {
      var move = "";
      var piece_symbols = {"Knight": "k", "Bishop": "b", "Rook": "r", "Queen": "q", "King": "k", "Pawn": ""};
      var col_letters = {0: "a", 1: "b", 2: "c", 3: "d", 4: "e", 5: "f", 6: "g", 7: "h"};
      // var connecting_char = "-";
      // if(dest.piece != null) {
      //   connecting_char = "x";
      // }
      // move.concat(piece_symbols[orig.piece.type], (orig.row + 1).toString(), col_letters[orig.col], piece_symbols[dest.piece.type], (dest.row + 1).toString(), col_letters[dest.col]);

      // A nullmove from the Engine to the GUI should be send as 0000.
      // Examples:  e2e4, e7e5, e1g1 (white short castling), e7e8q (for promotion)
      var promotion_val = '';
      if(queened_to != null) {
        var promotion_val = queened_to;
      }
      move = move.concat(col_letters[orig.col], (8 - orig.row).toString(), col_letters[dest.col], (8 - dest.row).toString(), promotion_val);

      if (queened_to != null) {
        move.concat("=", piece_symbols[queened_to.type]);
      }

      return move;
    };

    $scope.UCItoMove = function(move, color) {
      var move_split = move.split("");
      var charToInt = {'a':0, 'b':1, 'c':2, 'd':3, 'e':4, 'f':5, 'g':6, 'h':7}
      var intToInt = {8:0, 7:1, 6:2, 5:3, 4:4, 3:5, 2:6, 1:7};
      var old_x = charToInt[move_split[0]];
      var old_y = intToInt[move_split[1]];
      var new_x = charToInt[move_split[2]];
      var new_y = intToInt[move_split[3]];

      if($scope.board[new_y][new_x] != "") {
        if (color == $scope.player.color) {
          $scope.player.captured.push($scope.board[new_y][new_x]);
        } else {
          $scope.opponent.captured.push($scope.board[new_y][new_x]);
        }
      }
      $scope.board[new_y][new_x] = $scope.board[old_y][old_x];
      $scope.board[old_y][old_x] = "";
    }

    /**
     * @param board - the board
     * @param orig - dictionary of piece, row, and col of piece you want to move (keys are piece, row, col)
     * @param dest - dictionary of piece, row, and col of where you want to move (keys are piece, row, col)
     * @returns the board with the move done
     */
    $scope.makeMove = function(board, orig, dest) {
      //TODO: castling
      board[dest.row][dest.col] = board[orig.row][orig.col];
      board[orig.row][orig.col] = "";
      return board;
    };

    $scope.arrayClone = function(arr) {
      var board = [
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
      ];
      for(var i = 0; i < arr.length; i++) {
        for(var j = 0; j < arr[0].length; j++) {
          board[i][j] = arr[i][j];
        }
      }
      return board;
      // return JSON.parse(JSON.stringify(arr));

      // var i, copy;
      //
      // if( Array.isArray( arr ) ) {
      //   copy = arr.slice( 0 );
      //   for( i = 0; i < copy.length; i++ ) {
      //     copy[ i ] = $scope.arrayClone( copy[ i ] );
      //   }
      //   return copy;
      // } else if( typeof arr === 'object' ) {
      //   throw 'Cannot clone array containing an object!';
      // } else {
      //   return arr;
      // }
    };

    /**
     *
     * @param orig - dictionary of piece, row, and col of piece you want to move (keys are piece, row, col)
     * @param dest - dictionary of piece, row, and col of where you want to move (keys are piece, row, col)
     * @param determine_check = false if we are not determining if we are in check
     * @returns {boolean} true if move valid, false if not
     */
    $scope.legalMove = function (orig, dest, board, determine_check) {

      //TODO: Check if player is moving into check
      if(determine_check) {
        console.log("determining check");
        var king_x = -1;
        var king_y = -1;
        var new_board = $scope.arrayClone(board);
        new_board = $scope.makeMove(new_board, orig, dest);
        // find king
        for(var i = 0; i < new_board.length; i++) {
          for (var j = 0; j < new_board[0].length; j++) {
            if(new_board[i][j] != "" &&  new_board[i][j].type == "King" && new_board[i][j].color == orig.piece.color) {
              king_x = j;
              king_y = i;
            }
          }
        }
        // Iterate over all pieces and check if they can take the king, if so, this move is illegal
        for(var i = 0; i < new_board.length; i++) {
          for(var j = 0; j < new_board[0].length; j++) {
            if(new_board[i][j] != "" && new_board[i][j].color != orig.piece.color) {
              var king_loc = {
                "piece": new Piece("King", orig.piece.color),
                "row": king_y,
                "col": king_x
              };
              var attacking_piece_loc = {
                "piece": new_board[i][j],
                "row": i,
                "col": j
              };
              console.log(king_loc);
              console.log(attacking_piece_loc);
              if($scope.legalMove(attacking_piece_loc, king_loc, new_board, false)) {
                console.log("move not valid cause king in check");
                return false;
              }
            }
          }
        }
      }


      // Normal piece movement:

      // MOVE PAWN
      // TODO: also need en passant
      // TODO: also need queening?
      if (orig.piece.type == ("Pawn")) {
        var notation_arr = [].concat.apply([],$scope.notation);
        var last_move = notation_arr[notation_arr.length-1];
        var col_letters = {'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'f': 5, 'g': 6, 'h': 7};
        var last_move_from_y = col_letters[last_move[0]];
        var last_move_from_x = 8 - last_move[1];
        var last_move_to_y = col_letters[last_move[2]];
        var last_move_to_x = 8 - last_move[3];

        if (orig.piece.color == "black") {
          if ((dest.row == orig.row + 1) || // can only move forward by 1
            (orig.row == 1 && dest.row == orig.row + 2)) { // unless this is the first move, then can move forward by 2
            if ((dest.col == orig.col && dest.piece.type == null) ||  // can move directly forward if there is no piece there
              ((dest.col == orig.col + 1 || dest.col == orig.col - 1) && dest.piece.color == "white")) { // can move diagonally forward if taking
              return true;
            }
          }
          // En Passant
          if(last_move_from_y == 6 && last_move_to_y == 4 && board[to_y][to_x].type == ("Pawn") && orig.row == 4 && dest.row == 5 &&
            (orig.col == last_move_to_x + 1 || orig.col == to_x - 1) && dest.col == to_x) {
            return true;
          }

        } else if (orig.piece.color == "white") { // same rules as black but flipped
          if ((dest.row == orig.row - 1) || // can only move forward by 1
            (orig.row == 6 && dest.row == orig.row - 2)) { // unless this is the first move, then can move forward by 2
            if ((dest.col == orig.col && dest.piece.type == null) ||  // can move directly forward if there is no piece there
              ((dest.col == orig.col + 1 || dest.col == orig.col - 1) && dest.piece.color == "black")) { // can move diagonally forward if taking
              return true;
            }
            // En Passant
            if(last_move_from_y == 1 && last_move_to_y == 3 && board[to_y][to_x].type == ("Pawn") && orig.row == 3 && dest.row == 2 &&
              (orig.col == to_x + 1 || orig.col == to_x - 1) && dest.col == to_x) {
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
              if (board[orig.row][beginIndex + i] != "") {
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
              if (board[beginIndex + i][orig.col] != "") {
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
            //debugging: console.log(board[orig.row + i*UDdirection][orig.col + i*RLdirection])
            if (board[orig.row + i * UDdirection][orig.col + i * RLdirection] != "") {
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
        return ($scope.legalMove(rook_orig, dest, board, determine_check) || $scope.legalMove(bish_orig, dest, board, determine_check));


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


      // default return false
      return false;
    }

    $scope.computerMove = function() {
      var search_timelimit = 1000;

      var notation_arr = [].concat.apply([],$scope.notation);
      var notation_str = notation_arr.join(' ');

      stockfish.postMessage('position startpos moves ' + notation_str);
      stockfish.postMessage('go movetime ' + search_timelimit);
      var best_move = '';
      stockfish.onmessage = function(event) {
        if(event.data.startsWith('bestmove')) {
          best_move = event.data.split(' ')[1];
          console.log('BEST MOVE IS ' + best_move);
          var col_letters = {'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'f': 5, 'g': 6, 'h': 7};
          var from_y = col_letters[best_move[0]];
          var from_x = 8 - best_move[1];
          var to_y = col_letters[best_move[2]];
          var to_x = 8 - best_move[3];
          if ($scope.board[to_x][to_y] != "") {
            $scope.opponent.captured.push($scope.board[to_x][to_y]);
          }
          $scope.board[to_x][to_y] = $scope.board[from_x][from_y];
          $scope.board[from_x][from_y] = '';
          if ($scope.opponent.color == "white") {
            //TODO: queening/castling/enpassant
            $scope.notation.push([best_move, '']);
          } else {
            $scope.notation[$scope.notation.length - 1][1] = best_move;
            //console.log($scope.notation);
          }
          $scope.toMove = $scope.player.color;

          $scope.human_turn = true;
          $scope.$apply();

        }
      }
    };

    var stockfish = new Worker('js/stockfish.js');


  });
