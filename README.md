Imhotep
=======

Imhotep is a bot which requires you to make commits on Github in order to take control of a DJ spot on Turntable. It
makes a Turntable room into a KOTH productivity match!

Running the bot
===============

Create a user for the bot, and find your user information for the bot using [this bookmarklet](http://alaingilbert.github.com/Turntable-API/bookmarklet.html).

Create an application on Github.

Create a config.json file using the format provided in sample.config.json.

Install the following node modules:

  * ttapi
  * github
  * request
  * express

Then just run `node main.js` to start Imhotep

Using the bot
=============

Visit the website using the port you specified when you started Imhotep to associate your account with Github. Imhotep
will provide a command to run in chat which will link your accounts.

Type /dj to become a DJ. If there's room, you'll be able to join with no problem. If not, and you've made commits since you were last a DJ, this will kick out the longest-standing DJ.

Potential Problems
==================

Will not work if your server is located outside of the US.