var uppodLike = (function () {
    var players = {},
        likeTemplate = 'Ваше мнение о медиалекции? \
        <a class="like-button" href="#" title="нравится"><i class="icon-thumbs-up"></i></a>\
        <a class="dislike-button" href="#" title="не нравится"><i class="icon-thumbs-down"></i></a>',
        id, player,
        onUppodEvent = function (event) {
            var player = players[event.playerID],
                handler = player ? player['on' + event.eventName] : undefined;
            /* Executing event handler function on player by id. */
            if (handler) {
                handler.call(player);
            }
        };
        
    if ( typeof Array .prototype.forEach != 'function' ) { Array .prototype.forEach = function (callback){ for ( var i = 0 ; i < this .length; i++){ callback.apply( this , [ this [i], i, this ]); } }; }         

    /* Handle uppod event for player object */
    if (this.addEventListener) {
        this.addEventListener('uppodEvent', onUppodEvent);
    } else {
        this.attachEvent('uppodEvent' , onUppodEvent); 
    }

    /* Evaluating full view time and time of video for every player. */
    setInterval(function () {
        var status;
        for (id in players) {
            if (players.hasOwnProperty(id) && players[id].initialized) {
                status = parseInt(uppodGet(id, 'getstatus'), 10);
                if (status === 1) {
                    players[id].fulltime += 1;
                }
                players[id].time = parseInt(uppodGet(id, 'getimed'), 10);
            }
        }
    }, 1000);

    /* Creates node with like/dislike buttons. */
    function createLikeButtons(parent) {
        var likeContainer = document.createElement('p'), likeBtn, dislikeBtn;
        likeContainer.innerHTML = likeTemplate;
        likeBtn = likeContainer.getElementsByClassName('like-button')[0];
        dislikeBtn = likeContainer.getElementsByClassName('dislike-button')[0];
        likeBtn.onclick = function () {
            if (this.className.search('active') === -1) {
                this.className += " active";
            }
            dislikeBtn.className = dislikeBtn.className.replace(/active/g, "").trim();
            players[parent.id].like = true;
        };
        dislikeBtn.onclick = function () {
            if (this.className.search('active') === -1) {
                this.className += " active";
            }
            likeBtn.className = likeBtn.className.replace(/active/g, "").trim();
            players[parent.id].like = false;
        };
        parent.parentNode.insertBefore(likeContainer, parent.nextSibling);
    }

    /* Getting objects from HTML into players var. */
    [].forEach.call(document.getElementsByTagName('object'), function (object) {
        var html = object.innerHTML, player = {};
        if (html.search('uppod.swf') >= 0 && html.search('m=video') >= 0) {
            createLikeButtons(object);
            player = {
                id: object.id,
                initialized: false,
                el: object,
                fulltime: 0,
                ended: false
            };
            [].forEach.call(object.children, function (option) {
                if (option.tagName === 'PARAM') {
                    player[option.name] = option.value;
                    if (option.name === 'flashvars') {
                        player.name = option.value.match(/file=([\w\d\/\:\.]+\.[\w\d]{3,4})/)[1];
                    }
                }
            });
            players[player.id] = player;
        }
    });

    /* Setting events. */
    for (id in players) {
        if (players.hasOwnProperty(id)) {
            player = players[id];
            player.onend = function () {
                this.ended = true;
            };
            player.oninit = function () {
                this.initialized = true;
            };
        }
    }

    /* Returns JSON data */
    this.getJSON = function () {
        var data = [], player;
        for (id in players) {
            if (players.hasOwnProperty(id)) {
                player = players[id];
                if (player.fulltime === 0) {
                    continue;
                }
                data.push({
                    name: player.name,
                    time: player.time,
                    sumtime: player.fulltime,
                    ended: player.ended,
                    like: player.like
                });
            }
        }
        return JSON.stringify(data);
    };

    this.getPlayers = function () {
        return players;
    };

    return this;
})();

function uppodEvent(playerID, eventName, param) {
    var event;
    if (document.createEvent) {
        event = document.createEvent("Event");
        event.initEvent('uppodEvent', true, true);
    } else {
        //support for old browsers IE
        event = document.createEventObject();
        event.eventType = 'uppodEvent';
    }
    event.eventName = eventName;
    event.playerID = playerID;

    if (document.createEvent) {
        uppodLike.dispatchEvent(event);
    } else {
        uppodLike.fireEvent("on" + event.eventType, event);
    }
}