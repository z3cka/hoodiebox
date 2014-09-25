"use strict";
// initialize Hoodie
var hoodie  = new Hoodie();

// init player
var playerInst = new MediaElementPlayer('audio', {
// new MediaElementPlayer('audio', {
  /* Options */
  success: function (player, domObject) {
    // wait 'til data is loaded
    player.addEventListener('loadeddata', function(e) {
      // get furthest moment listened (if loggend in)
      if (hoodie.account.username) {
        hoodie.store.findAll(function (moment)  {
          // filter on current source only
          if (moment.src == "http://hb.sey.gr:8004/assets/files/YMIW210_Josh_Ruben.mp3") {
          // TODO: make this dynamic instead of using string like ^^
          // if (moment.src == player.media.currentSrc) {
            return true;
          }
        }).done(function(foundmoments) {
          // console.table(foundmoments);
          if (foundmoments.length > 0) {
            // set player at the furthest moment listened
            // find the max value of time in the found momen
            var headway = Math.max.apply(Math,foundmoments.map(function (o) {
              return o.time;
            }));
            // console.log("headway:")
            // console.log(headway);
            player.setCurrentTime(headway);
          }
        });
      }
    }, false);
    
    // listen for play event and do stuff every 5 seconds
    player.addEventListener('play', function(e) {
      var intervalID = setInterval(function() {
        getHeadway();
      }, 2000);
      player.addEventListener('pause', function(e, int) {
        clearInterval(intervalID);
      });  
    });
  }
});

// set play position when user signs in
hoodie.account.on('signin', function (user) {
  // get furthest moment listened
  hoodie.store.findAll('moment').done(function(foundmoments) {
    // console.log(foundmoments.length);
    if (foundmoments.length > 0) {
      // set player at the furthest moment listened
      var headway = foundmoments[0];
      playerInst.setCurrentTime(headway.time);
    }
  });
});

// reset player when user signs out
hoodie.account.on('signout', function(user) {
  // alert('you signed out!');
  playerInst.setCurrentTime(0);
});

function getHeadway() {
  // console.table(playerInst.media.currentSrc);
  // console.log("seconds listened");
  // console.log(playerInst.getCurrentTime());
  hoodie.store.add('moment', {
    time: playerInst.getCurrentTime(),
    src: playerInst.media.currentSrc
  });
}

// Todos Collection/View
function Todos($element) {
  var collection = [];
  var $el = $element;

  // Handle marking todo as "done"
  $el.on('click', 'input[type=checkbox]', function() {
    hoodie.store.remove('todo', $(this).parent().data('id'));
    return false;
  });

  // Handle "inline editing" of a todo.
  $el.on('click', 'label', function() {
    $(this).parent().parent().find('.editing').removeClass('editing');
    $(this).parent().addClass('editing');
    return false;
  });

  // Handle updating of an "inline edited" todo.
  $el.on('keypress', 'input[type=text]', function(event) {
    if (event.keyCode === 13) {
      hoodie.store.update('todo', $(this).parent().data('id'), {title: event.target.value});
    }
  });

  // Find index/position of a todo in collection.
  function getTodoItemIndexById(id) {
    for (var i = 0, len = collection.length; i < len; i++) {
      if (collection[i].id === id) {
        return i;
      }
    }
    return null;
  }

  function paint() {
    $el.html('');
    collection.sort(function(a, b) {
      return ( a.createdAt > b.createdAt ) ? 1 : -1;
    });
    for (var i = 0, len = collection.length; i<len; i++) {
      $el.append(
        '<li data-id="' + collection[i].id + '">' +
          '<input type="checkbox"> <label>' + collection[i].title + '</label>' +
          '<input type="text" value="' + collection[i].title + '"/>' +
        '</li>'
      );
    }
  }

  this.add = function(todo) {
    collection.push(todo);
    paint();
  };

  this.update = function(todo) {
    collection[getTodoItemIndexById(todo.id)] = todo;
    paint();
  };

  this.remove = function(todo) {
    collection.splice(getTodoItemIndexById(todo.id), 1);
    paint();
  };

  this.clear = function() {
    collection = [];
    paint();
  };
}

// Instantiate Todos collection & view.
var todos = new Todos($('#todolist'));

// initial load of all todo items from the store
hoodie.store.findAll('todo').then(function(allTodos) {
  allTodos.forEach(todos.add);
});

// when a todo changes, update the UI.
hoodie.store.on('add:todo', todos.add);
hoodie.store.on('update:todo', todos.update);
hoodie.store.on('remove:todo', todos.remove);
// clear todos when user logs out,
hoodie.account.on('signout', todos.clear);


// handle creating a new task
$('#todoinput').on('keypress', function(event) {
  // ENTER & non-empty.
  if (event.keyCode === 13 && event.target.value.length) {
    hoodie.store.add('todo', {title: event.target.value});
    event.target.value = '';
  }
});
