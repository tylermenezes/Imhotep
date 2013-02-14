var gh_tokens = {};

var fs = require('fs');
fs.readFile('users.json', 'utf8', function (err, data) {
    if (err || typeof(data) === 'undefined') {
        console.log("No user database.")
        gh_tokens = {};
    } else {
        console.log("Loading user database.");
        gh_tokens = JSON.parse(data);
    }
});

setInterval(function(){
    fs.writeFile("users.json", JSON.stringify(gh_tokens), function(err) {
        if(err) {
            console.log("Error writing user database: " + err);
        } else {
            console.log("User database saved!");
        }
    });
}, 30000);

var ImhotepUser = function(userid, name)
{
    var GitHubApi = require("github");
    var _ImhotepUser = this;
    this.userid = userid;
    this.name = name;
    this.github_token = null;
    this.last_commit = null;

    if (typeof(gh_tokens[userid]) !== 'undefined') {
        this.github_token = gh_tokens[userid];
    }

    this.get_last_commit = function(lambda, no_commit_lambda)
    {
        if (_ImhotepUser.github_token === null) {
            no_commit_lambda();
            return;
        }

        // Authenticate with GitHub
        var github = new GitHubApi({
            version: "3.0.0",
            timeout: 1000
        });
        github.authenticate({
            type: "oauth",
            token: _ImhotepUser.github_token
        });

        // Get the last commit
        github.user.get({}, function(err, data){
            github.events.getFromUser({
                user: data.login,
                page: 1,
                per_page: 30
            },
            function(err, res) {
                for (var i in res) {
                    var event = res[i];
                    if (event.type === 'PushEvent') {
                        lambda(event.payload.head);
                        return;
                    }
                }

                if (typeof(no_commit_lambda) !== 'undefined') {
                    no_commit_lambda();
                }
            });
        })
    }

    this.associate = function(token)
    {
        _ImhotepUser.github_token = token;
        gh_tokens[_ImhotepUser.userid] = token;
        console.log(gh_tokens);
    }
}

module.exports = ImhotepUser;
