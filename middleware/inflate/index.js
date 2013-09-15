var zlib = require('zlib');
//based off http://stackoverflow.com/questions/14194864/unzip-post-body-with-node-express
module.exports = function(script) {
    return function(req, res, next) {
        var data = [];
        req.addListener("data", function(chunk) {
            data.push(new Buffer(chunk));
        });
        req.addListener("end", function() {
            buffer = Buffer.concat(data);
            zlib.inflate(buffer, function(err, result) {
                if (!err) {
                    req.body = result.toString();
                    next();
                } else {
                    next(err);
                }
            });
        });
    }
}



