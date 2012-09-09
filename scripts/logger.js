define([], function() {

    function Logger(level) {
        this.level = level;
        this.levels = ["debug", "info", "warn"];
    }

    Logger.prototype = {
        debug: function(message) {
            this._write("debug", message);
        },

        info: function(message) {
            this._write("info", message);
        },

        warn: function(message) {
            this._write("warn", message);
        },

        error: function(message) {
            this._write("error", message);
        },

        _write: function(level, message) {
            if(this.levels.indexOf(level) < this.levels.indexOf(this.level)) return;

            console[level](message);
        }
    }

    return Logger;

});
