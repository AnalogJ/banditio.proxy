var zlib = require('zlib');
//based off http://stackoverflow.com/questions/14194864/unzip-post-body-with-node-express
module.exports = function(script) {
    return function(req, res, next) {

        var gunzip = gzip.createGunzip();
        res.pipe(gunzip);
        gunzip.on('data', function() {
            console.log(data);
        });

        next();


    }
}



