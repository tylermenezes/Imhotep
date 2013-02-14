var ImhotepWebServer = function(port, gh_public, gh_private)
{
    var _ImhotepWebServer = this;
    var request = require('request');
    var app = require('express')();

    this.outstanding_registration_requests = {};

    app.get('/', function(req, res)
    {
        res.writeHead(302, {'Location': 'https://github.com/login/oauth/authorize?client_id=' + gh_public + '&redirect_uri=http://' + req.headers.host + '/gh_return&scope=user,repo,repo:status'});
        res.end();
    });

    app.get('/gh_return', function(req, res)
    {
        request.post({
            "url": 'https://github.com/login/oauth/access_token',
            "headers": {
                "Accept": "application/json"
            },
            "form": {
                "client_id": gh_public,
                "client_secret": gh_private,
                "code": req.query["code"]
            }
        }, function(err, response, body)
        {
            var result = JSON.parse(body);
            var random = Math.floor(Math.random() * 999999999999);
            _ImhotepWebServer.outstanding_registration_requests[random] = result.access_token;
            res.end("Please enter the room and type the following in chat: /reg " + random);
        });
    });

    console.log('Web server starting.');
    app.listen(port);
}
module.exports = ImhotepWebServer;
