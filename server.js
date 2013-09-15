var http = require('http'),
    httpProxy = require('http-proxy');
//var bandit_inject = require('node-inject');
var bandit_inject = require('./middleware/inject');
//var bandit_inflate = require('./middleware/inflate');
var proxy_by_url = require('proxy-by-url')
//
// Create your proxy server
//
httpProxy.createServer(
    bandit_inject("https://raw.github.com/btotr/node-inject/master/example/inject.js"),
    proxy_by_url({
        '/sparktree': { port: 80, host: 'www.sparktree.com' }
    })
    //bandit_inflate(),

).listen(process.env.PORT ||8000);

//
// Create your target server
//
//http.createServer(function (req, res) {
//    res.writeHead(200, { 'Content-Type': 'text/plain' });
//    res.write('request successfully proxied!' + '\n' + JSON.stringify(req.headers, true, 2));
//    res.end();
//}).listen(9000);






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