var Proxy = require('../injection_proxy.js')
  , URL = require('url');

// Processor 
simpleProcessor = function(proxy) {
  var url;
   var bufs = [];

  this.handle_request = function(request, req_url) {
    url = req_url;
    //console.log("[" + url.hostname + url.pathname + "] - Processor request event, url: " + URL.format(req_url));
      console.log('Request Headers',request.headers)
  }

  this.handle_response = function(response) {
    console.log("[" + url.hostname + url.pathname + "] - Processor response event, response server header: " + response.headers.server);
    console.log('Response Headers',response.headers)
  }

  this.handle_response_data = function(data) {
    console.log("[" + url.hostname + url.pathname + "] - Processor response data event, length: " + data.length);
    bufs.push(data);
  }

  this.handle_response_end = function() {
    console.log("[" + url.hostname + url.pathname + "] - Processor response end event");
    var buf = Buffer.concat(bufs);
    var scriptElm = "\n<script type='text/javascript' src='jquery.min.1.2.js'></script>\n";
    if (true) {
        output = buf.toString().replace(/(<head[^>]*>)/, "$1" + scriptElm)
    }
    console.log(output);
  }
};

// Proxy
new Proxy({proxy_port: 8080, verbose: false}, simpleProcessor);
