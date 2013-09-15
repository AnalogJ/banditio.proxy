var http = require('http'),
    httpProxy = require('http-proxy'),
    fs = require('fs'),
    connect = require('connect');
//var bandit_base = requre('./middleware/base')
var bandit_inject = require('./middleware/inject');
var bandit_inflate = require('./middleware/inflate');
var proxy_by_url = require('proxy-by-url')
var injector = require('connect-injector');

var inject = injector(function (req, res) {
    return res.getHeader('content-type') && res.getHeader('content-type').indexOf('text/html') === 0;
}, function (callback, data) {
    callback(null, data.toString().replace('</body>', '<script type="text/javascript" scr="https://raw.github.com/btotr/node-inject/master/example/inject.js"></script></body>'));
});


//
// Create your proxy server
//
httpProxy.createServer(
    connect.logger('dev'),
    inject,
    //bandit_inject("https://raw.github.com/btotr/node-inject/master/example/inject.js"),
    //proxy_by_url({
    //    '/example': { port: 80, host: 'www.sparktree.com' }
    //})
    9000, 'localhost'
).listen(process.env.PORT ||8000);


//create simple html response server.

// create a static gzipped server
         /*
connect.createServer(
    //connect.compress(),
    function(req, res, next) {
        res.setHeader("Content-Type", "text/plain");
        next();
    },
    connect.static(__dirname)


).listen(9000);
   */

fs.readFile('./index.html', function (err, html) {
    if (err) {
        throw err;
    }
    connect.createServer(

        function(request, response) {
            response.writeHeader(200, {"Content-Type": "text/html"});
            response.write(html);
            response.end();
        },
        connect.compress()
    ).listen(9000);
});



/*


var httpProxy = require('http-proxy');
var url = require('url');

httpProxy.createServer(function(req, res, proxy) {

    var isHtml = false,
        write = res.write,
        writeHead = res.writeHead,
        params = url.parse(req.url, true).query,
        dest = params.dest || 'localhost',
        destination;

    dest = dest.match(/^http/) ? dest : 'http://' + dest;
    destination = url.parse(dest, true);

    req.headers['host'] = destination.host;
    req.headers['url'] = destination.href;

    delete req.headers['accept-encoding'];

    res.writeHead = function(code, headers) {
        console.log(arguments)
        isHtml = headers && headers['content-type'] && headers['content-type'].match('text/html');
        console.log('inside writeHead isHtml',isHtml)
        writeHead.apply(this, arguments);
    }

    res.write = function(data, encoding) {
        console.log(isHtml, params.dest)
        if (isHtml && params.dest) {
            var str = data.toString();
            var scriptTag = '<script type="text/javascript" src="http://code.jquery.com/jquery-1.7.min.js"></script>';
            var baseTag = '<base href="' + (dest.replace(/\/$/, '') || '') + '"/>';

            str = str.replace(/(<head[^>]*>)/, "$1" + "\n" + scriptTag + "\n" + baseTag);

            data = new Buffer(str);
        }

        write.call(this, data, encoding);
    };

    proxy.proxyRequest(req, res, {
        host: destination.host,
        port: 80,
    });
}).listen(9000, function () {
        console.log("Waiting for requests...");
    });
*/

/*
httpProxy = require('http-proxy');

httpProxy.createServer(function (req, res, proxy) {

    res.oldWriteHead = res.writeHead;
    res.writeHead = function(statusCode, headers) {
        //add logic to change headers here
        var contentType = res.getHeader('content-type');
        res.setHeader('content-type', 'text/plain');

        // old way: might not work now
        // as headers param is not always provided
        // https://github.com/nodejitsu/node-http-proxy/pull/260/files
        // headers['foo'] = 'bar';

        res.oldWriteHead(statusCode, headers);
    }

    proxy.proxyRequest(req, res, {
        host: '.com',
        port: 80
    });
}).listen(8000);
*/