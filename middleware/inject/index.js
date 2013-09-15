//based off the work of https://github.com/btotr/node-inject
module.exports = function(script) {
    return function(req, res, next) {
        var _write = res.write,
            _writeHead = res.writeHead,
            isHtml = false;

        var scriptElm = "\n<script type='text/javascript' src='" + script + "'></script>\n";

        // force uncompresed
        //req.headers['accept-encoding'] = '*;q=1,gzip=0';
        res.writeHead = function(code, headers) {
            var content_type_header = res.getHeader('content-type') || 'text/html';
            var content_length_header = res.getHeader('content-length')
            isHtml =  content_type_header && content_type_header.match('text/html');


            if (isHtml){
                console.log("writeHead",headers, isHtml, res.getHeader('content-type'))
                console.log('current_header_length', parseInt(content_length_header))
                console.log('new_header_length',  parseInt(content_length_header) + scriptElm.length)
                res.setHeader('content-length', parseInt(content_length_header) + scriptElm.length);
            }
            _writeHead.apply(this, arguments);
        }

        res.write = function(chunk, encoding) {
            if (isHtml) {
                var str = chunk.toString();

                str = str.replace(/(<head[^>]*>)/, "$1"  + scriptElm );
                data = new Buffer(str);
            }

            _write.call(res, data, encoding);

        }

        next();
    }
}


