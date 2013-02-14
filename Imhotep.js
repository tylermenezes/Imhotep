var Imhotep = function(userid, auth, roomid, port, gh_public, gh_secret)
{
    var Bot = require('ttapi');
    var ImhotepDjPanel = require('./ImhotepDjPanel.js');
    var ImhotepUserList = require('./ImhotepUserList.js');
    var ImhotepUser = require('./ImhotepUser.js');
    var ImhotepWebServer = require('./ImhotepWebServer.js');

    var dj_size = 5;

    var bot = new Bot(auth, userid);
    var panel = new ImhotepDjPanel(bot);
    var users = new ImhotepUserList();
    var web = new ImhotepWebServer(port, gh_public, gh_secret);


    bot.on('ready', function(data)
    {
        console.log('Bot ready!');
        bot.roomRegister(roomid);
    });

    bot.on('roomChanged', function(data)
    {
        console.log('Bot joined room.');
        dj_size = data.room.metadata.max_djs;
        console.log('Max DJs is ' + dj_size);
        for (var i in data.users) {
            var user = data.users[i];
            users.add(new ImhotepUser(user.userid, user.name));
        }
    });

    bot.on('registered', function(data){
        if (data.user[0].userid === userid) return;
        users.add(new ImhotepUser(data.user[0].userid, data.user[0].name));
    });

    bot.on('deregistered', function(data){
        users.delete(data.user[0].userid);
    });

    bot.on('speak', function(data){
        if (data.userid === userid) return; // Don't listen to ourself talk, it's distracting!
        if (data.text.substring(0,1) !== '/') return; // Not a command

        var command = data.text.split(' ')[0].substring(1);
        var args = data.text.substring(command.length + 2);

        user = users.get(data.userid);

        if (command === 'reg') {
            if (typeof(web.outstanding_registration_requests[args]) !== 'undefined') {
                user.associate(web.outstanding_registration_requests[args]);
                bot.speak('@' + data.name + ': I feel you, dawg.');
            } else {
                bot.speak('@' + data.name + ": I don't see you!");
            }
        } else if (command === 'dj') {
            console.log(user.name + ' is requesting a DJ spot.');
            if (panel.length < dj_size) {
                console.log('Empty slots -- DJing approved.');
                panel.approve_user(user);
            } else {
                console.log('Checking commit history for ' + user.name);
                user.get_last_commit(function(commit){
                    console.log('Last commit was ' + commit);
                    if(user.last_commit !== commit) {
                        bot.speak('@' + data.name + ": Nice commits you got, there!");
                        panel.approve_user(user);
                        user.last_commit = commit;
                    } else {
                        bot.speak('@' + data.name + ": You haven't committed anything since you last DJed!");
                        console.log(data.name + " denied for no new commits");
                    }
                }, function(){
                    bot.speak('@' + data.name + ": I don't see any commits? Have you linked your account?");
                })
            }
        } else {
            bot.speak('@' + data.name + ': Young Money #yolo #swag ' + Math.floor(Math.random() * 9999));
        }
    });
}
module.exports = Imhotep;
