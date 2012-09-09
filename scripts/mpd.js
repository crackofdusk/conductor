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

        this.socket.on('open', function() { self.isIdle = true; self._idle()});
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
        commands: [],
        version: "0",
        isIdle: false,
        updateHandler: function() {},

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
                var cb = function() { /* noop */};
            }

            var _send = function() {
                self.callbacks.push(function(data) {
                    cb(data);
                    self.isIdle = true;
                    self._idle();
                });

                self._write(command);
            }

            if(self.isIdle) {
                self.isIdle = false;
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
                            response = [];
                            isList = true;
                            response[i] = {};
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

        _handleUpdate: function(data) {
            if(data.changed) {
                this.logger.debug("New " + data.changed + " status");
                this.updateHandler(data.changed);
            }
        },

        _idle: function() {
            var self = this;

            this.callbacks.push(function(data) {
                self.logger.debug("Result of idling:");
                self.logger.debug(data);
                self._handleUpdate(data);

                // Make sure to not short-circuit the sending of a command
                if (self.isIdle) {
                    self._idle();
                }
            });
            self.logger.debug("Idling...")
            this._write("idle");
        },

    }

    // TODO: make user configurable
    var mpd = new MPD("localhost", 9000);
    mpd.connect();

    // A singleton, because it makes more sense for websocket I/O.
    return mpd;

});
