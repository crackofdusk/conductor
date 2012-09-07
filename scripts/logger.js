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
            this._write("debug", message);
        },

        warn: function(message) {
            this._write("debug", message);
        },

        _write: function(level, message) {
            if(this.levels.indexOf(level) >= this.levels.indexOf(this.level)) {
                console.log(message);
            }
        }
    }

    return Logger;

});
