var zlib = require('zlib');
//based off http://stackoverflow.com/questions/14194864/unzip-post-body-with-node-express
module.exports = function(script) {
    return function(req, res, next) {

        var gunzip = zlib.createGunzip();
        res.pipe(gunzip);
        gunzip.on('data', function() {
            console.log(data);
        });

        next();


    }
}




//decompress based on http://www.senchalabs.org/connect/compress.html

module.exports = function decompress(options) {
    options = options || {};
    var names = Object.keys(exports.methods)
        , filter = options.filter || exports.filter
        , threshold;

    if (false === options.threshold || 0 === options.threshold) {
        threshold = 0
    } else if ('string' === typeof options.threshold) {
        threshold = utils.parseBytes(options.threshold)
    } else {
        threshold = options.threshold || 1024
    }

    return function compress(req, res, next){
        var accept = req.headers['accept-encoding']
            , vary = res.getHeader('Vary')
            , write = res.write
            , end = res.end
            , compress = true
            , stream
            , method;

        // vary
        if (!vary) {
            res.setHeader('Vary', 'Accept-Encoding');
        } else if (!~vary.indexOf('Accept-Encoding')) {
            res.setHeader('Vary', vary + ', Accept-Encoding');
        }

        // see #724
        req.on('close', function(){
            res.write = res.end = function(){};
        });

        // proxy

        res.write = function(chunk, encoding){
            if (!this.headerSent) this._implicitHeader();
            return stream
                ? stream.write(new Buffer(chunk, encoding))
                : write.call(res, chunk, encoding);
        };

        res.end = function(chunk, encoding){
            if (chunk) {
                if (!this.headerSent && getSize(chunk) < threshold) compress = false;
                this.write(chunk, encoding);
            } else if (!this.headerSent) {
                // response size === 0
                compress = false;
            }
            return stream
                ? stream.end()
                : end.call(res);
        };

        res.on('header', function(){
            if (!compress) return;

            var encoding = res.getHeader('Content-Encoding') || 'identity';

            // already encoded
            if ('identity' != encoding) return;

            // default request filter
            if (!filter(req, res)) return;

            // SHOULD use identity
            if (!accept) return;

            // head
            if ('HEAD' == req.method) return;

            // default to gzip
            if ('*' == accept.trim()) method = 'gzip';

            // compression method
            if (!method) {
                for (var i = 0, len = names.length; i < len; ++i) {
                    if (~accept.indexOf(names[i])) {
                        method = names[i];
                        break;
                    }
                }
            }

            // compression method
            if (!method) return;

            // compression stream
            stream = exports.methods[method](options);

            // header fields
            res.setHeader('Content-Encoding', method);
            res.removeHeader('Content-Length');

            // compression

            stream.on('data', function(chunk){
                write.call(res, chunk);
            });

            stream.on('end', function(){
                end.call(res);
            });

            stream.on('drain', function() {
                res.emit('drain');
            });
        });

        next();
    };
};

function getSize(chunk) {
    return Buffer.isBuffer(chunk)
        ? chunk.length
        : Buffer.byteLength(chunk);
}