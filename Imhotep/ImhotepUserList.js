var ImhotepUserList = function()
{
    var users = {};

    this.add = function(user)
    {
        console.log('!!! adding ' + user.name);
        users[user.userid] = user;
    }

    this.get = function(id)
    {
        return users[id];
    }

    this.delete = function(id)
    {
        delete users[id];
    }
}

module.exports = ImhotepUserList;
