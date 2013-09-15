//based off the work of https://github.com/btotr/node-inject
module.exports = function(script) {
    return function(req, res, next) {
        //console.log('middleware', arguments)
        var _write = res.write,
            _writeHead = res.writeHead,
            isHtml = false;

        var scriptElm = "\n<script type='text/javascript' src='" + script + "'></script>\n";

        // force uncompresed
        //req.headers['accept-encoding'] = '*;q=1,gzip=0';
        console.log(req.headers)
        res.writeHead = function(code, headers) {
            var content_type_header = res.getHeader('content-type');
            var content_length_header = res.getHeader('content-length')
            isHtml =  content_type_header && content_type_header.match('text/html');
            isHtml;
            //console.log("writeHead",headers, isHtml, res.getHeader('content-type'))
            if (isHtml){
                console.log('current_header_length', parseInt(content_length_header))
                console.log('new_header_length',  parseInt(content_length_header) + scriptElm.length)
                //res.setHeader('content-length', parseInt(content_length_header) + scriptElm.length);
            }
            _writeHead.apply(this, arguments);
        }

        res.write = function(chunk, encoding) {
            console.log("write", isHtml)
            /*if (isHtml) {
                chunk = chunk.toString().replace(/(<head[^>]*>)/, "$1" + scriptElm)
            }
            _write.call(res, chunk);

            */
            if (isHtml) {
                var str = chunk.toString();
                console.log(str);
                //var baseTag = '<base href="' + (dest.replace(/\/$/, '') || '') + '"/>';

                //str = str.replace(/(<head[^>]*>)/, "$1"  + scriptElm );

                //data = new Buffer(str);
                data = chunk;
            }

            _write.call(res, data, encoding);

        }
        next();
    }
}


