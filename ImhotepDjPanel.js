var ImhotepDj = function(userid)
{
    var _ImhotepDj = this;
    this.became_dj = (new Date());
    this.userid = userid;
}

var ImhotepDjPanel = function(bot)
{
    var _ImhotepDjPanel = this;

    var onstage_djs = [];
    var awaiting_djs = [];

    var dj_size = 5;

    var playing_dj = null;

    var removeA = function(arr) {
        var what, a = arguments, L = a.length, ax;
        while (L > 1 && arr.length) {
            what = a[--L];
            while ((ax= arr.indexOf(what)) !== -1) {
                arr.splice(ax, 1);
            }
        }
        return arr;
    }

    this.__defineGetter__('length', function(){
        return onstage_djs.length;
    });

    bot.on('newsong', function(data)
    {
        playing_dj = data.room.current_dj;
    });

    var on_song_end_lambdas = [];
    bot.on('endsong', function(data)
    {
        for (var i in on_song_end_lambdas) {
            on_song_end_lambdas[i]();
        }

        on_song_end_lambdas = [];
    })

    var make_way = function(lambda)
    {
        var oldest_dj = null;
        if (onstage_djs.length >= dj_size) {
            for (var i in onstage_djs) {
                var dj = onstage_djs[i];
                if (oldest_dj == null || dj.became_dj < oldest_dj.became_dj) {
                    oldest_dj = dj;
                }
            }
        }

        var fn = function()
        {
            try { bot.remDj(oldest_dj.userid); } catch (er) {}
            lambda();
        }


        // If the oldest DJ is currently playing a song, wait for him to finish before kicking him.
        if (playing_dj !== null && oldest_dj !== null && playing_dj == oldest_dj.userid) {
            bot.speak("After this song, the current DJ will be escorted off the stage to make room.");
            on_song_end_lambdas.push(fn);
        } else {
            fn();
        }
    }

    this.approve_user = function(user)
    {
        if (awaiting_djs.indexOf(user.userid) > -1) {
            bot.speak('@' + user.name + ": I heard you the last time!");
            return;
        }
        console.log('Approving ' + user.name + ' to DJ.');
        make_way(function(){
            awaiting_djs.push(user.userid);
            bot.speak('@' + user.name + ': You have 30 seconds to step up!');
            setTimeout(function(){
                if (awaiting_djs.indexOf(user.userid) > -1) {
                    removeA(awaiting_djs, user.userid);
                    bot.speak('@' + user.name + ': You missed your chance!');
                }
            }, 30000);
        });
    }

    bot.on('roomChanged', function(data)
    {
        dj_size = data.room.metadata.max_djs;
        for(var i in data.djids) {
            console.log('!!! Adding current DJ: ' + data.djids[i]);
            onstage_djs.push(new ImhotepDj(data.djids[i]));
        }
    });

    bot.on('add_dj', function(data)
    {
        var approved = (function(){
            for(var i in awaiting_djs) {
                if (awaiting_djs[i] === data.user[0].userid) return true;
            }
            return false;
        })();

        if (approved) {
            removeA(awaiting_djs, data.user[0].userid);
            onstage_djs.push(new ImhotepDj(data.user[0].userid));
        } else {
            bot.remDj(data.user[0].userid);
            bot.speak('@' + data.user[0].name + ': Say /dj to request a DJ spot.');
        }
    });

    bot.on('rem_dj', function(data)
    {
        for (var i in onstage_djs) {
            if (onstage_djs[i].userid === data.user[0].userid) {
                delete onstage_djs[i];
                return;
            }
        }
    });
}
module.exports = ImhotepDjPanel;
