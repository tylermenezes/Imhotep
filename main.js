fs = require('fs')
fs.readFile('config.json', 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }

    config = JSON.parse(data);

    var Imhotep = require('./Imhotep/Imhotep.js');
    for (var i in config.bots) {
        var bot_info = config.bots[i];
        var bot = new Imhotep(bot_info.userid, bot_info.auth, bot_info.roomid, bot_info.port, bot_info.gh.public, bot_info.gh.secret);
    }
});
