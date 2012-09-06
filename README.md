# Conductor

Experimental [Music Player Daemon](http://mpd.wikia.com) web client.


## Setup

Start your MPD server and note the port on which it is listening. Set up
[websockify](https://github.com/kanaka/websockify) as a proxy between this app
(which uses web sockets) and MPD (which uses TCP sockets). For example:

    ./websockify 9000 localhost:6600


## License

Conductor is available under the terms of the MIT license. See LICENSE.txt.
