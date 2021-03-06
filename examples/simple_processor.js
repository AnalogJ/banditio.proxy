var Proxy = require('../proxy.js')
  , URL = require('url');

// Processor 
simpleProcessor = function(proxy) {
  var url;
   var bufs = [];

  proxy.on('request', function(request, req_url) {
    url = req_url;
    //console.log("[" + url.hostname + url.pathname + "] - Processor request event, url: " + URL.format(req_url));
      console.log('Request Headers',request.headers)
  })

  proxy.on('response', function(response) {
    console.log("[" + url.hostname + url.pathname + "] - Processor response event, response server header: " + response.headers.server);
      console.log('Response Headers',response.headers)
  });

  proxy.on('response_data', function(data) {
   console.log("[" + url.hostname + url.pathname + "] - Processor response data event, length: " + data.length);

      bufs.push(data);
  });

  proxy.on('response_end', function() {
    console.log("[" + url.hostname + url.pathname + "] - Processor response end event");
      var buf = Buffer.concat(bufs);
      //console.log(buf.toString());
  });
};

// Proxy
new Proxy({proxy_port: 8080, verbose: false}, simpleProcessor);
