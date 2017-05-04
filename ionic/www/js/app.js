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


  .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

    $ionicConfigProvider.views.maxCache(0);

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
        params:
          {
            singlePlayer: false,
            multiPlayer: false
          },
        views: {
          'vert-view': {
            templateUrl: "templates/vert.html",
            controller: "vertCtrl",
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


    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        $scope.currentState = "Logout"
        $scope.userName = firebase.auth().currentUser.email;
        $scope.$apply();
      } else {
        $scope.currentState = "Login"
        $scope.$apply();
      }
    });

    // for testing
    $scope.email = "test_user@yahoo.com";
    $scope.password = "password";

    $scope.login = function () {

      console.log("clicked login button")
      document.getElementById('loader').style.display = 'block';
      Auth.$signInWithEmailAndPassword($scope.email, $scope.password)
        .then(function (user) {
          console.log("User logged in!!! Userid:" + user.uid);
          $scope.currentState = "Logout"
          $scope.userName = user.username;
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
      firebase.auth().createUserWithEmailAndPassword($scope.email, $scope.password)
        .then(function (User) {
          $scope.currentState = "Logout";
          // $scope.userName = firebase.auth().currentUser.email;
          User.updateProfile({
            displayName: $scope.username
            //photoURL: //idk
          }).then(function() {
            //console.log(JSON.stringify(User) + " is user")
          })
          $scope.$apply();

          // Add user to user database
          var user = firebase.auth().currentUser;
          firebase.database().ref('users/' + user.uid).set({
            username: $scope.username,
            email: user.email,
          })

          $scope.popup_close();
        })
        .catch(function (error) {
          alert("create user failed " + error);
        })
    };

    $scope.singlePlayer = function () {
      $state.go('view.vert', {singlePlayer: true, multiPlayer: false});
    };
    $scope.multiPlayer = function() {
      $state.go('view.vert', {multiPlayer: true, singlePlayer: false});
    };
  })

  .controller('vertCtrl', function ($scope, $state, $stateParams, $ionicHistory, $interval, $timeout) {
    function Piece(type, color) {
      this.type = type;
      this.color = color;
      this.isCaptured = false;
      this.hasMoved = false;

      if (this.type == "Pawn") {
        this.value = 1;
        this.notation = "";
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


    function getTimeRemaining(t) {
      var seconds = Math.floor ( (t/1000) % 60);
      var minutes = Math.floor ( (t/60/1000) % 60);
      if (seconds < 10) {
        seconds = "0" + seconds;
      }
      console.log("minutes = " + minutes);
      console.log("seconds = " + seconds);
      return {
        'minutes' : minutes,
        'seconds' : seconds
      };
    }

    var timeinterval, timeint;
    $scope.clock1 = 5*60*1000;
    $scope.clock2 = 5*60*1000;

    $scope.startClock1 = function() {
      console.log("startClock1");
      timeinterval = $interval(function () {
        console.log("interval1")
        var t = getTimeRemaining($scope.clock1);
        $scope.time1 = t.minutes.toString() + ':' + t.seconds.toString();
        $scope.clock1 -= 100;
        if (t.minutes == 0 && t.seconds == 0) {
          $timeout = true;
          $scope.stopT1();
          console.log("A");
          $scope.timeout_popup();
        } else if ($scope.toMove == "black") {
          console.log("B");
          $scope.stopT1();
          $scope.startClock2();
        }
      }, 100);
    }
    $scope.startClock2 = function() {
      console.log("startClock2");
      timeint = $interval(function() {
        console.log("interval2")
        var m = getTimeRemaining($scope.clock2);
        $scope.time2 = m.minutes.toString() + ":" + m.seconds.toString();
        $scope.clock2 -= 100;
        if (m.minutes == 0 && m.seconds == 0 ) {
          console.log("C");
          $timeout = true;
          $scope.stopT2();
          $scope.timeout_popup();
        } else if ($scope.toMove == "white") {
          console.log("D");
          $scope.stopT2();
          $scope.startClock1();
        }
      }, 100);
    }
    $scope.stopT1 = function() {
      $interval.cancel(timeinterval);
    }
    $scope.stopT2 = function() {
      $interval.cancel(timeint);
    }
    $scope.stopT1();
    $scope.stopT2();



    $scope.username1 = " ";
    $scope.username2 = " ";

    $scope.avatar1 = "img/duckie.png";
    $scope.avatar2 = "img/ellie.png";

    //$scope.color1 = "black";
    //$scope.color2 = "white";

    $scope.notation = [];
    $scope.algebraic_notation = [];
    $scope.toMove = "white"

    $scope.capturedPieces1 = [];
    $scope.capturedPieces2 = [];


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

    $scope.select_game = [];  // supplies options for multiplayer game id choice

    $scope.appearance = 1;
    $scope.last_move_en_passant = false;
    $scope.promoting_to = "Queen";

    $scope.gameID = -1; //error if not updated before create game

    $scope.opponent = {
      username: $scope.username1,
      avatar: $scope.avatar1,
      color: "",
      captured: $scope.capturedPieces1
    };
    $scope.player = {
      username: $scope.username2,
      avatar: $scope.avatar2,
      color: "",
      captured: $scope.capturedPieces2
    };

    //Check if user already has a game in progress
    $scope.load_game_booll = null;
    firebase.auth().onAuthStateChanged(function (user) {
      $scope.user = user
      if ($scope.user) {
        console.log("user is valid for database access");
        $scope.username2 = $scope.user.displayName;
        if ($stateParams.singlePlayer) {
          $timeout(function() {
            console.log("Waiting 500ms")

            firebase.database().ref('users/' + $scope.user.uid).once("value")
              .then(function (snapshot) {
                $scope.username1 = "StockFish"
                $scope.username2 = user.displayName;

                $scope.opponent = {
                  username: $scope.username1,
                  avatar: $scope.avatar1,
                  color: "",
                  captured: $scope.capturedPieces1
                };

                $scope.player = {
                  username: $scope.username2,
                  avatar: $scope.avatar2,
                  color: "",
                  captured: $scope.capturedPieces2
                };
                try {
                  $scope.load_game_bool = snapshot.val().single_player_Game;
                  console.log("load game: " + $scope.load_game_bool)
                  if ($scope.load_game_bool) {
                    console.log("OPening cont_game_popup")
                    $scope.cont_game_popup();
                  } else {
                    console.log("opeing generic popup")
                    $scope.stockFish_popup();
                  }
                } catch (error) {
                  console.log(error);
                }
                if (!$scope.load_game_bool) {
                  $scope.stockFish_popup();
                }

              })
          }, 1000);
        } else if ($stateParams.multiPlayer) {
          $timeout(function () { console.log ("Waiting 500 ms")
          firebase.database().ref('users/' + $scope.user.uid).once("value")
            .then(function () {
              $scope.opponent = {
                username: $scope.username1,
                avatar: $scope.avatar1,
                color: "",
                captured: $scope.capturedPieces1
              };
              $scope.player = {
                username: $scope.username2,
                avatar: $scope.avatar2,
                color: "",
                captured: $scope.capturedPieces2
              };
            })

          $scope.multiPlayer_popup();
          }, 1000)

        } else {
          console.log("UNHANDLED GAME STATE")
        }
      }
    });


    $scope.stockFish_popup = function () {
      if ($scope.user) {
        //clear single_player_Game database
        firebase.database().ref('users/' + $scope.user.uid + "/single_player_Game").set(null);

      }
      document.getElementById('stockFish_popup').style.display = 'block';
    }

    $scope.cont_game_popup = function() {
      document.getElementById('cont_game_popup').style.display = 'block';
    }

    $scope.setMultiPlayer = function () {
      if ($scope.user) {
        $scope.player.color = $scope.selectedColor;

        if($scope.player.color == "white") {
          $scope.opponent.color = "black"
        } else if ($scope.player.color == "black") {
          $scope.opponent.color = "white"
        } else {
          console.log("ERROR in setMultipPLayer")
        }


        // Generate new Key
        var maxNum = 10000;
        if (2 * $scope.select_game.length > maxNum) {
          maxNum = 4 * $scope.select_game.length;
        }
        $scope.gameID = -1;
        while ($scope.select_game.indexOf($scope.gameID) >= 0 || $scope.gameID < 0) {
          $scope.gameID = Math.floor(Math.random() * maxNum);
        }
        console.log("generated gameID: " + $scope.gameID)


        console.log($scope.gameID)
        firebase.database().ref("multiPlayerGames/").update(
          {
            [$scope.gameID]: {
              Agent1: $scope.user.uid,
              player1: $scope.player,
              board: $scope.board,
              toMove: 'white',
            }
          })
      } else {
        console.log("Cannot access database, problem with user")
      }
      $scope.createMPDBListener();
      $scope.popup_close();

      $scope.startClock2();
    }

    $scope.multiPlayer_popup = function () {
      console.log("displaying multiplayer popup")
      document.getElementById('multiPlayer_popup').style.display = 'block';
      console.log( "display: "+ document.getElementById('multiPlayer_popup').style.display)

      // set Games to pick from
      firebase.database().ref("multiPlayerGames").on("value", function (snapshot) {
        $scope.$evalAsync(function () { //idk if necessary
          console.log("Saw database change in multiplayer game keys");
          var keys = [];
          snapshot.forEach(function (childSnapshot) {
            if (!childSnapshot.val().Agent1 && !childSnapshot.val().Agent2 && childSnapshot.key > 0) {
              console.log("NO USER CONNECTED: REMOVING GAME " + childSnapshot.key)
              firebase.database().ref("multiPlayerGames/" + childSnapshot.key).remove();
            // } else if (childSnapshot.val().Agent1 && childSnapshot.val().Agent2) {
            //   //pass
            } else {
              var displayString = "";
              if (childSnapshot.val().player1.username == " " || childSnapshot.val().player1.username == null) {
                displayString = "anon"
              } else {
                displayString = childSnapshot.val().player1.username;
              }
              keys.push({value: childSnapshot.key, name: displayString + " - ID:" + childSnapshot.key});
            }
          });
          $scope.select_game = keys;

        })
      }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      });

      $scope.$apply();

    }

    $scope.joinMultiPlayer = function () {
      if ($scope.user) {
        var ref = firebase.database().ref("multiPlayerGames/" + $scope.gameID);

        ref.once("value").then(function(snapshot){
          var name = ($scope.user.displayName) ? $scope.user.displayName : "Anon";
          var pic = ($scope.user.avatar) ? $scope.user.avatar : "na";
          $scope.username = name;

          if (snapshot.val().Agent1) {  // Other user is player1
            if (snapshot.val().player1.color == "white") {
              $scope.player.color = "black"
              //$scope.player2.color = "black" // redundant
              $scope.opponent.color = "white"
              //$scope.player1.color = "white" // redundant
            } else {
              $scope.player.color = "white"
              //$scope.player2.color = "white" // redundant
              $scope.opponent.color = "black"
              //$scope.player1.color = "black" // redundant
            }
            // necessary b/c firebase cannot handle null
            var player = {username: name, color: $scope.player.color, avatar: pic}
            ref.update(
              {
                Agent2: $scope.user.uid,
                player2: player
              })
          } else if (snapshot.val().Agent2) {
            if (snapshot.val().player1.color == "white") {
              $scope.player.color = "black"
              $scope.player2.color = "black" // redundant
              $scope.opponent.color = "white"
              $scope.player1.color = "white" // redundant
            } else {
              $scope.player.color = "white"
              $scope.player2.color = "white" // redundant
              $scope.opponent.color = "black"
              $scope.player1.color = "black" // redundant
            }
            var player = {username: name, color: $scope.player.color, avatar: pic}
            ref.update(
              {
                Agent1: $scope.user.uid,
                player1: player
              })
          } else {
            console.log("ERROR")
          }
          // Manually update UI
          $scope.board = snapshot.val().board;
          $scope.toMove = snapshot.val().toMove;
          console.log("MP database notation: " + snapshot.val().notation)
          console.log("MP database notation: " + snapshot.val().algebraic_notation)
          if(snapshot.val().notation) {
            $scope.notation = snapshot.val().notation;
          }
          if(snapshot.val().algebraic_notation) {
            $scope.algebraic_notation = snapshot.val().algebraic_notation;
          }
        })
      } else {
        console.log("Cannot access database, problem with user")
      }
      $scope.createMPDBListener();
      $scope.popup_close();

    }

    $scope.createMPDBListener = function() {
      //if ($scope.user) {
      if($stateParams.multiPlayer) {
        console.log("loading multiplayer database")
        console.log($scope.gameID);
        firebase.database().ref("multiPlayerGames/" + $scope.gameID + "/").on("value", function (snapshot) {
          $scope.$evalAsync(function () {
            console.log("Game Listener Activated")
            $scope.board = snapshot.val().board;
            $scope.toMove = snapshot.val().toMove;
            if (snapshot.val().checkmate) {
              $scope.checkmate_popup();
              // clean up game
              var ref = firebase.database().ref("multiPlayerGames/" + $scope.gameID + "/Agent1").remove();
              var ref = firebase.database().ref("multiPlayerGames/" + $scope.gameID + "/Agent2").remove();
              $scope.stopT1();
              $scope.stopT2();
            }
            console.log("MP database notation: " + snapshot.val().notation)
            console.log("MP database algebraic_notation: " + snapshot.val().algebraic_notation)
            if(snapshot.val().notation) {
              $scope.notation = snapshot.val().notation;
            }
            if(snapshot.val().algebraic_notation) {
              $scope.algebraic_notation = snapshot.val().algebraic_notation;
            }
          })

          //FOR DISCONNECT
          if ($scope.user) {
            if (snapshot.val().Agent1 == $scope.user.uid) {
              var ref = firebase.database().ref("multiPlayerGames/" + $scope.gameID + "/Agent1");
              ref.onDisconnect().remove();
            } else if (snapshot.val().Agent2 == $scope.user.uid) { // current user is player 2
              var ref = firebase.database().ref("multiPlayerGames/" + $scope.gameID + "/Agent2");
              ref.onDisconnect().remove();
            }
          }

        }, function (errorObject) {
          console.log("The read failed: " + errorObject.code);
        });

      }
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
      console.log("calling POPUP CLOSE()")
      document.getElementById('stockFish_popup').style.display = 'none';
      document.getElementById('cont_game_popup').style.display = 'none';
      document.getElementById("multiPlayer_popup").style.display = 'none';
      document.getElementById('checkmate_popup').style.display = 'none';
      document.getElementById('stalemate_popup').style.display = 'none';

      if ($stateParams.singlePlayer) {
        $scope.setStockFish();
      }
      console.log($scope.gameID);


      if($scope.opponent.color == "white" && $stateParams.singlePlayer) {
        $scope.computerMove();
      }
      $scope.startClock2();
    }

    $scope.load_game = function() {
      document.getElementById('cont_game_popup').style.display = 'none';
      var load_notation = $scope.load_game_bool.notation;
      var load_algebraic_notation = $scope.load_game_bool.algebraic_notation;
      $scope.player.color = $scope.load_game_bool.color;

      if ($scope.player.color == "white") {
        $scope.opponent.color = "black";
      } else if ($scope.player.color == "black"){
        $scope.opponent.color = "white"
      }

      for (var i=0; i < load_notation.length; i++) {
        $scope.UCItoMove(load_notation[i][0], "white");
        $scope.toMove = "black";
        if (load_notation[i][1]) {
          $scope.UCItoMove(load_notation[i][1], "black");
          $scope.toMove = "white";
        }
      }
      $scope.notation = load_notation;
      $scope.algebraic_notation = load_algebraic_notation;

      if ($scope.toMove == $scope.opponent.color) {
        $scope.computerMove();
      }
    };

    $scope.back_button = function() {
      $state.go("view.start", {}, {reload: true});

    }

    $scope.checkmate_popup = function() {
      document.getElementById('checkmate_popup').style.display = 'block';
      if($stateParams.singlePlayer) {
        console.log("removing sinlge player game data")
        firebase.database().ref('users/' + $scope.user.uid + "/single_player_Game").remove();

      }
      $scope.stopT2();
      $scope.stopT1();
    }

    $scope.stalemate_popup = function() {
      document.getElementById('stalemate_popup').style.display = 'block';
      if($stateParams.singlePlayer) {
        console.log("removing sinlge player game data")
        firebase.database().ref('users/' + $scope.user.uid + "/single_player_Game").remove();

      }
      $scope.stopT1();
      $scope.stopT2();
    }

    $scope.checkmate_newGame = function() {

      //$state.reload();

      $state.go($state.current, {}, {reload: true});

      // $timeout(function () {
      //   $ionicHistory.clearCache();
      //   $ionicHistory.clearHistory();
      //   console.log('clearing cache')
      // },300)
      //
      // $state.go("view.start", {do_reload: true})
      // // $ionicHistory.clearCache().then(function(){
      // $state.reload();
      //   //$state.go('view.vert', {}, {reload: false});
      // })
     // $state.reload();
      //$window.location.reload(true)
      //$state.go("view.vert", {singlePlayer: $stateParams.singlePlayer, multiPlayer: $stateParams.multiPlayer}, {reload: true});
      // $scope.popup_close();
      // if($stateParams.singlePlayer) {
      //   $state.reload();
      //   $scope.stockFish_popup();
      // } else if ($stateParams.multiPlayer) {
      //   $state.reload();
      //   $scope.multiPlayer_popup();
      // } else {
      //   console.log("ERROR")
      // }
    }

    var selected_cell = -1;
    $scope.cell_clicked = function (n) {
      if ($scope.player.color === "black"){
        n = 63 - n;
      }

      if (selected_cell == -1) {
        selected_cell = n;

        var old_row = Math.floor(selected_cell / 8);
        var old_col = selected_cell % 8;

        if (!$scope.board[old_row][old_col]){
          // didn't click a piece
          selected_cell = -1;
        } else if ($scope.board[old_row][old_col].color !== $scope.player.color) {
          selected_cell = -1;
        }

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
        $scope.last_move_en_passant = false;

        var notation_arr = [].concat.apply([],$scope.notation);
        var last_move = null;
        if (notation_arr[notation_arr.length-1] && orig.piece.color == "white") {
          var last_move = notation_arr[notation_arr.length - 1];
        }
        else if (notation_arr[notation_arr.length-2] && orig.piece.color == "black") {
          var last_move = notation_arr[notation_arr.length - 2];
        }
        if ($scope.legalMove(orig, dest, $scope.board, true, last_move) && $scope.toMove == $scope.player.color && $scope.toMove == $scope.board[old_row][old_col].color) {
          if ($scope.board[new_row][new_col] != "") {
            $scope.player.captured.push($scope.board[new_row][new_col]);
          }

          // player notation
          var this_move = $scope.moveToUCINotation(orig, dest, null);
          //TODO checks, checkmate, castling, abiguous pieces
          var capture = "-";
          if(dest.piece != "") {
            capture = "x";
          }
          var this_move_algebraic = orig.piece.notation + this_move[0] + this_move[1] + capture + this_move[2] + this_move[3];
          if(this_move_algebraic == "Ke1-g1" || this_move_algebraic == "Ke8-g8") {
            this_move_algebraic = "0-0";
          }
          if(this_move_algebraic == "Ke1-g1+" || this_move_algebraic == "Ke8-g8+") {
            this_move_algebraic = "0-0+";
          }
          if(this_move_algebraic == "Ke1-c1" || this_move_algebraic == "Ke8-c8") {
            this_move_algebraic = "0-0-0";
          }
          if(this_move_algebraic == "Ke1-c1+" || this_move_algebraic == "Ke8-c8+") {
            this_move_algebraic = "0-0-0+";
          }
          $scope.makeMove($scope.board, orig, dest, $scope.promoting_to, last_move);
          if($scope.isInCheck($scope.board, $scope.opponent.color)) {
            if($scope.inCheckmate($scope.player.color, $scope.board, last_move)) {
              this_move_algebraic = this_move_algebraic + "#";
            } else {
              this_move_algebraic = this_move_algebraic + "+";
            }
          }
          if ($scope.player.color == "white") {
            //TODO: queening/castling/enpassant
            console.log("notation: " + $scope.notation)
            $scope.notation.push([this_move, '']);
            $scope.algebraic_notation.push([this_move_algebraic, '']);
            // !!!!! $scope.notation.push([$scope.moveToUCINotation(orig, dest, null), '']);
            //console.log($scope.notation);
          } else {
            $scope.notation[$scope.notation.length - 1][1] = this_move;
            $scope.algebraic_notation[$scope.algebraic_notation.length - 1][1] = this_move_algebraic;
            //console.log($scope.notation);
          }


          if($scope.inCheckmate($scope.opponent.color, $scope.board, this_move)) {
            console.log($scope.opponent.color + " is checkmated!");
            $scope.checkmate_popup();
            if($stateParams.multiPlayer) {
              firebase.database().ref("multiPlayerGames/" + $scope.gameID + "/").update({checkmate: 1});
            }
          }
          if($scope.inStalemate($scope.opponent.color, $scope.board, this_move)) {
            console.log($scope.opponent.color + " is stalemated!");
            $scope.stalemate_popup();
            if($stateParams.multiPlayer) {
              firebase.database().ref("multiPlayerGames/" + $scope.gameID + "/").update({stalemate: 1});
            }
          }
          $scope.toMove = $scope.opponent.color;

          if ($stateParams.singlePlayer) {
            $scope.computerMove();
          }

          // Update MP database
          if ($scope.user) {
            if ($stateParams.multiPlayer) {
              console.log("updating Multiplayer database");

              if ($scope.player.color == "white"){
                console.log("UPDATING TOMOVE to black")
                firebase.database().ref("multiPlayerGames/" + $scope.gameID).update({
                  toMove: "black",
                  board: $scope.board,
                  notation: $scope.notation,
                  algebraic_notation: $scope.algebraic_notation
                });
              } else {
                firebase.database().ref("multiPlayerGames/" + $scope.gameID).update({
                  toMove: "white",
                  board: $scope.board,
                  notation: $scope.notation,
                  algebraic_notation: $scope.algebraic_notation
                });
              }

              firebase.database().ref("multiPlayerGames/" + $scope.gameID).update({board: $scope.board});
            } else if ($stateParams.singlePlayer) {
              console.log("updating singleplayer database");
              firebase.database().ref('users/' + $scope.user.uid + "/single_player_Game").update({
                color: $scope.player.color,
                notation: $scope.notation,
                algebraic_notation: $scope.algebraic_notation
              });
            }
          }
        }
        selected_cell = -1;
      }
    };

    $scope.get_piece_image_icon = function (piece) {
      if (piece == "") {
        return "img/transparent.png";
      } else {
        return "img/" + piece.color + piece.type + $scope.appearance + ".png";
      }
    };

    $scope.is_selected_cell = function (index) {
      if ($scope.player.color === 'black') {
        index = 63 - index;
      }

      if (index === selected_cell) {
        return true;
      } else {
        return false;
      }
    };

    $scope.is_legal_move = function (index) {
      if (selected_cell == -1) {
        return false;
      }

      if ($scope.player.color === 'black') {
        index = 63 - index;
      }

      var row = Math.floor(index / 8);
      var col = index % 8;

      var sel_row = Math.floor(selected_cell / 8);
      var sel_col = selected_cell % 8;

      var orig = {
        "piece": $scope.board[sel_row][sel_col],
        "row": sel_row,
        "col": sel_col
      };
      var dest = {
        "piece": $scope.board[row][col], // need peice to know if null ("")
        "row": row,
        "col": col
      };

      var notation_arr = [].concat.apply([],$scope.notation);
      var last_move = null;
      if (notation_arr[notation_arr.length-1] && orig.piece.color == "white") {
        var last_move = notation_arr[notation_arr.length - 1];
      }
      else if (notation_arr[notation_arr.length-2] && orig.piece.color == "black") {
        var last_move = notation_arr[notation_arr.length - 2];
      }

      if ($scope.legalMove(orig, dest, $scope.board, false, last_move)) {
        return true;
      }

      return false;
    };

    $scope.place_peices = function() {

      //Clear board
      // for (var i = 0; i < 8; i ++) {
      //   for (var j = 0; j < 8; j++) {
      //     $scope.board[i][j] = "";
      //   }
      // }

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
      $scope.$evalAsync();
    }
    $scope.place_peices();

    $scope.getBoard = function () {
      var b = [].concat.apply([], $scope.board);

      if ($scope.player.color === "black") {
        b.reverse();
      }

      return b;
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
      var piece_symbols = {"Knight": "N", "Bishop": "B", "Rook": "R", "Queen": "Q", "King": "K", "Pawn": ""};
      var col_letters = {0: "a", 1: "b", 2: "c", 3: "d", 4: "e", 5: "f", 6: "g", 7: "h"};

      // A nullmove from the Engine to the GUI should be send as 0000.
      // Examples:  e2e4, e7e5, e1g1 (white short castling), e7e8q (for promotion)
      // stop promotion for not
      var promotion_val = '';
      if(queened_to != null) {
        var promotion_val = queened_to.toLowerCase();
      }
      move = move.concat(col_letters[orig.col], (8 - orig.row).toString(), col_letters[dest.col], (8 - dest.row).toString(), promotion_val);

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

    $scope.inStalemate = function(color, board, last_move) {
      if(!$scope.isInCheck(board, color) && !$scope.hasLegalMove(color, board, last_move)) {
        return true;
      } else {
        return false;
      }
    };

    $scope.inCheckmate = function(color, board, last_move) {
      if($scope.isInCheck(board, color) && !$scope.hasLegalMove(color, board, last_move)) {
        return true;
      }
      return false;
    };

    $scope.hasLegalMove = function(color, board, last_move) {
      for(var old_row = 0; old_row < 8; old_row++) {
        for(var old_col = 0; old_col < 8; old_col++) {
          var from = {
            "piece": board[old_row][old_col],
            "row": old_row,
            "col": old_col
          };
          if(from.piece.color == color) {
            for (var new_row = 0; new_row < 8; new_row++) {
              for (var new_col = 0; new_col < 8; new_col++) {
                var dest = {
                  "piece": board[new_row][new_col], // need peice to know if null ("")
                  "row": new_row,
                  "col": new_col
                };

                if ($scope.legalMove(from, dest, board, true, last_move)) {
                  return true;
                }
              }
            }
          }
        }
      }
      return false;
    };

    /**
     * @param board - the board
     * @param orig - dictionary of piece, row, and col of piece you want to move (keys are piece, row, col)
     * @param dest - dictionary of piece, row, and col of where you want to move (keys are piece, row, col)
     * @returns the board with the move done
     */
    $scope.makeMove = function(board, orig, dest, promoting_to=null, last_move=null) {
      //TODO: castling
      board[dest.row][dest.col] = board[orig.row][orig.col];
      board[orig.row][orig.col] = "";

      if(orig.piece.type == "Pawn" && ((orig.piece.color == "black" && dest.row == 7) || (orig.piece.color == "white" && dest.row == 0))) {
        //TODO: set promoting_to in GUI somehow
        console.log("PROMOTION of: " + orig.piece.type)
        console.log("Location: " + orig.piece.color + " " + dest.row + dest.col)
        if(promoting_to == null) {
          console.log("No piece promotion value specified! Default to Queen")
          promoting_to = "Queen";
        }
        board[dest.row][dest.col] = new Piece(promoting_to, orig.piece.color);
      }

      // Castling special cases
      var this_move = $scope.moveToUCINotation(orig, dest, null);
      if(this_move == 'e1g1') {
        board[7][5] = board[7][7];
        board[7][7] = "";
      } else if(this_move == 'e1c1') {
        board[7][3] = board[7][0];
        board[7][0] = "";
      } else if(this_move == 'e8g8') {
        board[0][5] = board[0][7];
        board[0][7] = "";
      } else if(this_move == 'e8c8') {
        board[0][3] = board[0][0];
        board[0][0] = "";
      }

      // En passant special case
      if (orig.piece.type == ("Pawn") && (last_move != null)) {
        var col_letters = {'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'f': 5, 'g': 6, 'h': 7};
        var last_move_from_x = col_letters[last_move[0]];
        var last_move_from_y = 8 - last_move[1];
        var last_move_to_x = col_letters[last_move[2]];
        var last_move_to_y = 8 - last_move[3];
        if (orig.piece.color == "black") {
          // En Passant
          if (last_move_from_y == 6 && last_move_to_y == 4 && board[last_move_to_y][last_move_to_x].type == ("Pawn") && orig.row == 4 && dest.row == 5 &&
            (orig.col == last_move_to_x + 1 || orig.col == last_move_to_x - 1) && dest.col == last_move_to_x) {
              board[orig.row][dest.col] = "";
          }

        } else if (orig.piece.color == "white") {
          // En Passant
          if (last_move_from_y == 1 && last_move_to_y == 3 && board[last_move_to_y][last_move_to_x].type == ("Pawn") && orig.row == 3 && dest.row == 2 &&
            (orig.col == last_move_to_x + 1 || orig.col == last_move_to_x - 1) && dest.col == last_move_to_x) {
                board[orig.row][dest.col] = "";
          }

        }
      }
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
    };

    $scope.isInCheck = function(board, color) {
      console.log("determining check");
      var king_x = -1;
      var king_y = -1;
      // find king
      for(var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
          if(board[i][j] != "" &&  board[i][j].type == "King" && board[i][j].color == color) {
            king_x = j;
            king_y = i;
          }
        }
      }
      // Iterate over all pieces and check if they can take the king, if so, this move is illegal
      for(var i = 0; i < board.length; i++) {
        for(var j = 0; j < board[0].length; j++) {
          if(board[i][j] != "" && board[i][j].color != color) {
            var king_loc = {
              "piece": new Piece("King", color),
              "row": king_y,
              "col": king_x
            };
            var attacking_piece_loc = {
              "piece": board[i][j],
              "row": i,
              "col": j
            };
            // console.log(king_loc);
            // console.log(attacking_piece_loc);
            if($scope.legalMove(attacking_piece_loc, king_loc, board, false, null)) {
              console.log("move not valid cause king in check");
              return true;
            }
          }
        }
      }
      return false;
    };

    /**
     *
     * @param orig - dictionary of piece, row, and col of piece you want to move (keys are piece, row, col)
     * @param dest - dictionary of piece, row, and col of where you want to move (keys are piece, row, col)
     * @param determine_check = false if we are not determining if we are in check
     * @returns {boolean} true if move valid, false if not
     */
    $scope.legalMove = function (orig, dest, board, determine_check, last_move) {

      if(determine_check) {
        var new_board = $scope.arrayClone(board);
        new_board = $scope.makeMove(new_board, orig, dest, null, last_move);
        if($scope.isInCheck(new_board, orig.piece.color)) {
          return false;
        }
      }
      // Normal piece movement:

      // MOVE PAWN
      // TODO: also need queening?
      if (orig.piece.type == ("Pawn")) {
        if (orig.piece.color == "black") {
          if ((dest.row == orig.row + 1)) {
            if ((dest.col == orig.col && dest.piece.type == null) ||  // can move directly forward if there is no piece there
              ((dest.col == orig.col + 1 || dest.col == orig.col - 1) && dest.piece.color == "white")) { // can move diagonally forward if taking
              return true;
            }
          }
          if(orig.row == 1 && dest.row == orig.row + 2 && orig.col == dest.col
                 && board[2][dest.col] == "" && board[3][dest.col] == "") {
            return true;
          }

        } else if (orig.piece.color == "white") { // same rules as black but flipped
          if ((dest.row == orig.row - 1)) {
            if ((dest.col == orig.col && dest.piece.type == null) ||  // can move directly forward if there is no piece there
              ((dest.col == orig.col + 1 || dest.col == orig.col - 1) && dest.piece.color == "black")) { // can move diagonally forward if taking
              return true;
            }
          }
          if(orig.row == 6 && dest.row == orig.row - 2 && orig.col == dest.col &&
                  board[5][dest.col] == "" && board[4][dest.col] == "") {
            return true;
          }
        }

        if(last_move != null) {
          var col_letters = {'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'f': 5, 'g': 6, 'h': 7};
          var last_move_from_x = col_letters[last_move[0]];
          var last_move_from_y = 8 - last_move[1];
          var last_move_to_x = col_letters[last_move[2]];
          var last_move_to_y = 8 - last_move[3];
          if(orig.piece.color == "black") {
            // En Passant
            if(last_move_from_y == 6 && last_move_to_y == 4 && board[last_move_to_y][last_move_to_x].type == ("Pawn") && orig.row == 4 && dest.row == 5 &&
              (orig.col == last_move_to_x + 1 || orig.col == last_move_to_x - 1) && dest.col == last_move_to_x) {
              return true;
            }

          } else if(orig.piece.color == "white") {
            // En Passant
            if(last_move_from_y == 1 && last_move_to_y == 3 && board[last_move_to_y][last_move_to_x].type == ("Pawn") && orig.row == 3 && dest.row == 2 &&
              (orig.col == last_move_to_x + 1 || orig.col == last_move_to_x - 1) && dest.col == last_move_to_x) {
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
        return ($scope.legalMove(rook_orig, dest, board, determine_check, last_move) || $scope.legalMove(bish_orig, dest, board, determine_check, last_move));

        // MOVE KING
      } else if (orig.piece.type == ("King")) {
        if (dest.piece.color != orig.piece.color) { // cannot move to destination occupied by self
          var columnDiff = Math.abs(dest.col - orig.col);
          var rowDiff = Math.abs(dest.row - orig.row);

          if (columnDiff <= 1 && rowDiff <= 1) {
            return true;
          }

          // check king in right spot (and that we aren't determining if a piece is in check, can't take a piece when castling
          if(((orig.piece.color == "black" && orig.row == 0) || (orig.piece.color == "white" && orig.row == 7)) &&
            orig.col == 4 && board[orig.row][orig.col].hasMoved == false && determine_check == true) {
            // kingside
            if(board[orig.row][7] != "" && board[orig.row][7].type == ("Rook") && board[orig.row][7].hasMoved == false &&
              board[orig.row][5] == "" && board[orig.row][6] == "") {
              var new_board = $scope.arrayClone(board);
              var in_between = {
                "piece": new Piece("King", orig.piece.color),
                "row": orig.row,
                "col": 5
              };
              new_board = $scope.makeMove(new_board, orig, in_between, null, null);

              // Can't castle if in check or moving through check (moving into check handled at beginning of function)
              if(!$scope.isInCheck(board, orig.piece.color) && !$scope.isInCheck(new_board, orig.piece.color)) {
                return true;
              }
            }
            // queenside
            if(board[orig.row][0] != "" && board[orig.row][0].type == ("Rook") && board[orig.row][0].hasMoved == false &&
              board[orig.row][1] == "" && board[orig.row][2] == "" && board[orig.row][3] == "") {
              var new_board = $scope.arrayClone(board);
              var in_between = {
                "piece": new Piece("King", orig.piece.color),
                "row": orig.row,
                "col": 3
              };
              new_board = $scope.makeMove(new_board, orig, in_between, null, null);

              // Can't castle if in check or moving through check (moving into check handled at beginning of function)
              if(!$scope.isInCheck(board, orig.piece.color) && !$scope.isInCheck(new_board, orig.piece.color)) {
                return true;
              }
            }
          }
        }
      } else {
        console.log("ERROR: Type does not exist. Inputs were " + JSON.stringify(orig) + JSON.stringify(dest))
        console.log(new Error().stack);
      }

      // default return false
      return false;
    }

    $scope.computerMove = function() {
      var search_timelimit = 1000;

      var notation_arr = [].concat.apply([], $scope.notation);
      var notation_str = notation_arr.join(' ');
      var last_move = null;
      if (notation_arr[notation_arr.length-1]) {
        var last_move = notation_arr[notation_arr.length - 1];
      }

      stockfish.postMessage('position startpos moves ' + notation_str);
      stockfish.postMessage('go movetime ' + search_timelimit);
      var best_move = '';
      stockfish.onmessage = function (event) {
        if (event.data.startsWith('bestmove')) {
          best_move = event.data.split(' ')[1];
          console.log('BEST MOVE IS ' + best_move);
          var col_letters = {'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'f': 5, 'g': 6, 'h': 7};
          var from_x = col_letters[best_move[0]];
          var from_y = 8 - best_move[1];
          var to_x = col_letters[best_move[2]];
          var to_y = 8 - best_move[3];
          var promoting_to = null;
          if(best_move.length >= 3) {
            promoting_to = best_move[4];
          }
          if ($scope.board[to_y][to_x] != "") {
            $scope.opponent.captured.push($scope.board[to_y][to_x]);
          }
          var orig = {
            "piece": $scope.board[from_y][from_x],
            "row": from_y,
            "col": from_x
          };
          var dest = {
            "piece": $scope.board[to_y][to_x], // need peice to know if null ("")
            "row": to_y,
            "col": to_x
          };
          //TODO checks, checkmate, castling, abiguous pieces
          var capture = "-";
          if(dest.piece != "") {
            capture = "x";
          }
          var best_move_algebraic = orig.piece.notation + best_move[0] + best_move[1] + capture + best_move[2] + best_move[3];
          if(best_move_algebraic == "Ke1-g1" || best_move_algebraic == "Ke8-g8") {
            best_move_algebraic = "0-0";
          }
          if(best_move_algebraic == "Ke1-g1+" || best_move_algebraic == "Ke8-g8+") {
            best_move_algebraic = "0-0+";
          }
          if(best_move_algebraic == "Ke1-c1" || best_move_algebraic == "Ke8-c8") {
            best_move_algebraic = "0-0-0";
          }
          if(best_move_algebraic == "Ke1-c1+" || best_move_algebraic == "Ke8-c8+") {
            best_move_algebraic = "0-0-0+";
          }
          $scope.board = $scope.makeMove($scope.board, orig, dest, promoting_to, last_move);
          if($scope.isInCheck($scope.board, $scope.player.color)) {
            if($scope.inCheckmate($scope.player.color, $scope.board, best_move)) {
              best_move_algebraic = best_move_algebraic + "#";
            } else {
              best_move_algebraic = best_move_algebraic + "+";
            }
          }
          if ($scope.opponent.color == "white") {
            //TODO: queening/castling/enpassant
            $scope.notation.push([best_move, '']);
            $scope.algebraic_notation.push([best_move_algebraic, '']);
          } else {
            $scope.notation[$scope.notation.length - 1][1] = best_move;
            $scope.algebraic_notation[$scope.algebraic_notation.length - 1][1] = best_move_algebraic;
            //console.log($scope.notation);
          }

          $scope.toMove = $scope.player.color;
          $scope.human_turn = true;

          if($scope.inCheckmate($scope.player.color, $scope.board, best_move)) {
            console.log($scope.player.color + " is checkmated!");
            $scope.checkmate_popup();
          }

          if($scope.inStalemate($scope.player.color, $scope.board, best_move)) {
            console.log($scope.player.color + " is stalemate!");
            $scope.stalemate_popup();
          }

          $scope.$apply();
        }
      };
    }

    var stockfish = new Worker('js/stockfish.js');

    console.log("FINISHED LOADING CONTROLLER")
    if ($stateParams.singlePlayer) {
      console.log("Single player mode")
    } else if ($stateParams.multiPlayer) {
      console.log("Multiple Player Mode")
    } else {
      // Mode not defined
      console.log("MODE NOT DEFINED. DEGENERATE TO START SCREEN")
      $scope.back_button();

    }

  });
