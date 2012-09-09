/*
 * Based on node-mpdsocket by Eli Wenig. Original notice:
 *
 *  * author: Eli Wenig (http://eliwenig.com/) <eli@csh.rit.edu>
 *  *
 *  * copyright (c) 2011 Eli Wenig
 *  * made available under the MIT license
 *  *   http://www.opensource.org/licenses/mit-license.php
 *  *
 *
 */

define(['lib/websock', 'logger'], function (Websock, Logger) {

    function MPD(host, port) {
        var self = this;

        this.socketURI = 'ws://' + host + ":" + port;
        this.socket = new Websock();

        this.socket.on('open', function() {
            self.getStatus();
            self.getPlaylist();

            self.idling = true;
            self._idle()
        });
        this.socket.on('error', function(e) { throw e });
        this.socket.on('message', function() { self._handleMessage() });

        this.logger = new Logger("debug");
    }

    MPD.prototype = {
        socketURI: null,
        socket: null,
        host: null,
        port: null,
        callbacks: [],
        events: [],
        version: "0",
        idling: false,

        updateHandlers: {
            player: this.getStatus,
            playlist: this.getPlaylist,
        },

        getStatus: function() {
            var self = this;

            self.send("status", function(data) {
                self.emit('status', data);
            })
        },

        getPlaylist: function() {
            var self = this;

            self.send("playlistinfo", function(data) {
                self.logger.debug(data);

                if(!data[0] && !data.file) return;

                if(data.file) {
                    data = [data];
                }

                self.emit('playlist', data);
            })
        },

        emit: function (event) {
            if (!this.events[event]) return;

            var args = Array.prototype.slice.call(arguments, 1),
                callbacks = this.events[event];

            for (var i = 0, len = callbacks.length; i < len; i++) {
                callbacks[i].apply(null, args);
            }
        },

        on: function(event, fn) {
            this.events[event] || (this.events[event] = []);
            this.events[event].push(fn);
        },

        off: function(event, fn) {
            var events = this.events[event],
                index = events.indexOf(fn);

            ~index && events.splice(index, 1);
        },

        connect: function() {
            this.socket.open(this.socketURI);
        },

        disconnect: function() {
            this.socket.close();
        },

        // TODO: handle closed socket
        send: function(command, callback) {
            var cb = callback,
                self = this;

            if(typeof cb !== "function") {
                self.logger.debug("No callback given, using noop.");
                var cb = noop;
            }

            var _send = function() {
                self.callbacks.push(function(data) {
                    cb(data);
                    self.idling = true;
                    self._idle();
                });

                self._write(command);
            }

            if(self.idling) {
                self.idling = false;
                self._write("noidle");
                _send();
            } else {
                _send();
            }

        },

        _handleMessage: function() {
            var data,
                lines,
                l,
                i = 0,
                response = {},
                isList = false;


            data = this.socket.rQshiftStr();
            lines = data.split("\n");

            for (l in lines) {
                if (lines[l].match(/^ACK/)) {
                    response = lines[l].substr(10);
                    this.callbacks.shift()(response)
                    response = {};
                    return;
                } else if (lines[l].match(/^OK MPD/)) {
                    if (this.version == "0") {
                        this.version = lines[l].split(' ')[2];
                        return;
                    }
                } else if (lines[l].match(/^OK$/)) {
                    i = 0;
                    this.callbacks.shift()(response);
                    response = {};
                    return;
                } else {
                    var attr = lines[l].substr(0,lines[l].indexOf(":"));
                    var value = lines[l].substr((lines[l].indexOf(":"))+1);
                    value = value.replace(/^\s+|\s+$/g, ''); // trim whitespace
                    if (!isList) {
                        if (typeof(response[attr]) != 'undefined') {
                            //make ordered list
                            var tempResponse = [];
                            tempResponse[i] = response;
                            response = tempResponse;
                            isList = true;
                            response[++i] = {};
                            response[i][attr] = value;
                        } else {
                            response[attr] = value;
                        }
                    } else {
                        if (typeof(response[i][attr]) != 'undefined' || attr == "playlist" || attr == "file" || attr == "directory") {
                            response[++i] = {};
                            response[i][attr] = value;
                        } else {
                            response[i][attr] = value;
                        }
                    }
                }
            }
        },

        _write: function(command) {
            this.socket.send_string(command + "\n")
        },

        _update: function(data) {
            if(data.changed) {
                this.logger.debug("New " + data.changed + " status");
                this.updateHandlers[data.changed](this);
            } else {
                // The playlist has most likely changed (playlist editing, consume mode, etc.)
                this.updateHandlers.playlist(this);
            }
        },

        _idle: function() {
            var self = this;

            this.callbacks.push(function(data) {
                self._update(data);

                // Make sure to not short-circuit the sending of a command
                if (self.idling) {
                    self._idle();
                }
            });
            self.logger.debug("Idling...")
            this._write("idle");
        },

    }

    function noop() {}

    // TODO: make user configurable
    var mpd = new MPD("localhost", 9000);
    mpd.connect();

    // A singleton, because it makes more sense for websocket I/O.
    return mpd;

});
