var http = require('http-get'),
    httpProxy = require('http-proxy'),
    vows = require('vows'),
    assert = require('assert');

// Create a test suite
vows.describe('inflate').addBatch({
    'when connecting to a proxy': {
        topic: function() {
            // make the request object
            http.get({url: 'http://localhost:8000'}, null, this.callback);
        },
        'it can be accessed': function(err, res) {
            assert.isNull(err);
            assert.isObject (res);
        },
    },
    'when opening a gzipped page': {
        topic: function() {
            var self = this;
            http.get({url: 'http://localhost:8000', stream: true}, null, function (error, result) {
                result.stream.on('data', function(data){
                    self.callback(null, data.toString().indexOf(script));
                });
                result.stream.resume();
            });
        },
        'a script should be injected': function(err, index) {
            assert.isNumber(index);
            assert.notEqual(index, -1);
        }
    },
    'when opening a non-gzipped page': {
        topic: function() {
            var self = this;
            http.get({url: 'http://localhost:8000', stream: true}, null, function (error, result) {
                result.stream.on('data', function(data){
                    self.callback(null, data.toString().indexOf(script));
                });
                result.stream.resume();
            });
        },
        'a script should do nothing': function(err, index) {
            assert.isNumber(index);
            assert.notEqual(index, -1);
        }
    },
}).export(module);

// create a proxy server
httpProxy.createServer(
    require('../')(script),
    function(req, res, proxy) {
        proxy.proxyRequest(req, res, {
            host: 'www.sparktree.com',
            port: 80
        });
    }
).listen(8000);
