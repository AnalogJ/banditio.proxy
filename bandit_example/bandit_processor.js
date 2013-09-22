var Proxy = require('../bandit_proxy.js')
    , URL = require('url');

// Processor 
simpleProcessor = function (proxy) {
    var url;
    var bufs = [];
    var scriptElm = "\n<script type='text/javascript' src='jquery.min.1.2.js'></script>\n";
    var response_opts = {
        injectable: false,
        recordable: true,
        gzipped: false,
        deflated: false,
        content_encoding: '',
        content_type: ''
    }


    function is_stubbed(request) {

    }

    function is_recordable(content_type) {
        var recordable_mimetypes = [
            'application/x-javascript',
            'application/x-latex',
            'message/rfc822',
            'text/css',
            'text/html',
            'text/plain',
            'text/richtext',
            'text/scriptlet',
            'application/json',
            'application/javascript',
            'application/xml',
            'text/xml',
            'text/javascript',
            'application/atom+xml',
            'application/rss+xml'
        ];
        for (var mimetype in recordable_mimetypes) {
            if (content_type.indexOf(mimetype) !== -1) {
                return true;
            }
        }
        return false;
    }

    function parse_response_header(response) {
        //check if content is gzipped/deflated
        response_opts.content_encoding = response.headers['content-encoding'] || ''
        response_opts.gzipped = (response_opts.content_encoding == 'gzip')
        response_opts.deflated = (response_opts.content_encoding == 'deflate')

        response_opts.content_type = response.headers['content-type'] || "text/html";

        //check if response if injectable
        response_opts.injectable = (response_opts.content_type.indexOf('text/html') !== -1);

        //check if response is recordable
        response_opts.recordable = is_recordable(response_opts.content_type)
        console.log(response_opts)
    }

    this.handle_request = function (request, req_url) {
        url = req_url;
        //console.log("[" + url.hostname + url.pathname + "] - Processor request event, url: " + URL.format(req_url));
        console.log('Request Headers', request.headers)
    }

    this.handle_response = function (response) {
        console.log("[" + url.hostname + url.pathname + "] - Processor response event, response server header: " + response.headers.server);
        console.log('Response Headers', response.headers)
        parse_response_header(response)

        if(response_opts.injectable){
            //calculate new response header here.
            response.headers['content-length'] = parseInt(response.headers['content-length']) + scriptElm.length;
            console.log(response.headers['content-length']);
        }

    }

    this.handle_response_data = function (data) {
        console.log("[" + url.hostname + url.pathname + "] - Processor response data event, length: " + data.length);

        if (response_opts.recordable || response_opts.injectable) {
            //the response is recordable or injectable, that means you should store the data being sent and do something with
            //it later
            bufs.push(data);
            return null; //dont output anything to be sent to the user yet.
        }
        return data;

    }

    this.handle_response_end = function () {
        console.log("[" + url.hostname + url.pathname + "] - Processor response end event");
        if (response_opts.recordable || response_opts.injectable) {

            var buf = Buffer.concat(bufs);
            var response_str = buf.toString();
            /* THis should never be required any more. The accept-encoding header if overridden.
            if(response_opts.gzipped){
                zlib.gunzip(buf, function(err, result){
                    console.log(result.toString())
                });
            }
            else if(resp_content_encoding ==  'deflate'){
                zlib.inflate(bug, function(err, result){
                    console.log(result.toString())
                })
            }
            else {
                response_str = buf.toString();
            }
            */
            if (response_opts.injectable) {

                console.log('inject the script');
                response_str = response_str.replace(/(<head[^>]*>)/, "$1" + scriptElm)
                console.log(response_str)
                return response_str
            }
            else {
                //not injectable, but recordable, so send a message here to the listeners then send the buffer to the waiting user
                return buf;
            }
        }
        return null;
    }
};

// Proxy
new Proxy({proxy_port: 8080, verbose: false}, simpleProcessor);
