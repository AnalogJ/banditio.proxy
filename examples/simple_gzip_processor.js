var Proxy = require('../proxy.js')
  , URL = require('url');
var zlib = require('zlib');
// Processor 
simpleProcessor = function(proxy) {
  var url;
  var bufs = [];
  var resp_content_encoding = '';
  proxy.on('request', function(request, req_url) {
    url = req_url;
    //console.log("[" + url.hostname + url.pathname + "] - Processor request event, url: " + URL.format(req_url));
      console.log('Request Headers',request.headers)
  })

  proxy.on('response', function(response) {
    console.log("[" + url.hostname + url.pathname + "] - Processor response event, response server header: " + response.headers.server);
    console.log('Response Headers',response.headers)
    resp_content_encoding =  response.headers['content-encoding']
  });

  proxy.on('response_data', function(data) {
   console.log("[" + url.hostname + url.pathname + "] - Processor response data event, length: " + data.length);

      bufs.push(data);
  });

  proxy.on('response_end', function() {
    console.log("[" + url.hostname + url.pathname + "] - Processor response end event");
      var buf = Buffer.concat(bufs);
      if(resp_content_encoding == 'gzip'){
          zlib.gunzip(buf, function(err, result){
              console.log(result.toString())
          });
      }
      else if(resp_content_encoding ==  'deflate'){
          zlib.inflate(bug, function(err, result){
            console.log(result.toString())
          })
      }
      else{
          console.log(buf.toString());
      }

  });
};

// Proxy
new Proxy({proxy_port: 8080, verbose: false}, simpleProcessor);
