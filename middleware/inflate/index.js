var zlib = require('zlib');
//based off http://stackoverflow.com/questions/14194864/unzip-post-body-with-node-express
module.exports = function(script) {
    return function(req, res, next) {


        var data = [];
        res.addListener("data", function(chunk) {
            data.push(new Buffer(chunk));
        });
        res.addListener("end", function() {
            buffer = Buffer.concat(data);
            zlib.inflate(buffer, function(err, result) {
                if (!err) {
                    console.log('body:', result.toString())
                    res.body = result.toString();
                    next();
                } else {
                    console.log('err')
                    next(err);
                }
            });
        });
        /*
        //========= Based off this function
        res.write = function(chunk, encoding) {
            console.log("write", isHtml)

            if (isHtml) {
                //var str = chunk.toString();
                console.log(str);
                //var baseTag = '<base href="' + (dest.replace(/\/$/, '') || '') + '"/>';

                //str = str.replace(/(<head[^>]*>)/, "$1"  + scriptElm );

                //data = new Buffer(str);
                data = chunk;
            }

            _write.call(res, data, encoding);

        }
         */
        next();


    }
}



