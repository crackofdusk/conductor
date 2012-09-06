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

define(['lib/websock'], function (Websock) {

    function MPD(host, port) {
        var that = this;

        this.socketURI = 'ws://' + host + ":" + port;
        this.socket = new Websock();

        this.socket.on('open', function() { that._idle()});
        this.socket.on('error', function(e) { throw e });
        this.socket.on('message', function() { that._handleMessage() });
    }

    MPD.prototype = {
        socketURI: null,
        socket: null,
        host: null,
        port: null,
        callbacks: [],
        commands: [],
        version: "0",

        connect: function() {
            this.socket.open(this.socketURI);
        },

        disconnect: function() {
            this.socket.close();
        },


        // TODO: handle closed socket
        send: function(command, callback) {
            var cb = callback;

            if(typeof cb !== "function") {
                var cb = function() { /* noop */};
            }

            this._noidle();
            this.callbacks.push(cb);
            this._write(command);
            this._idle();
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

        _idle: function() {
            this.callbacks.push(function() { /* noop */ });
            this._write("idle");
        },

        _noidle: function() {
            this._write("noidle");
        },
    }


    return MPD;

});
