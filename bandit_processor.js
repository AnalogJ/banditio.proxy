var Proxy = require('./bandit_proxy.js')
    , URL = require('url');
var uuid = require('node-uuid');
var socketio = require('socket.io-client');
var nconf = require('nconf');
// Processor 
simpleProcessor = function (room_id) {
    var url;
    var bufs = [];
    var _room_id = room_id
    var _resource_id = uuid.v1();

    //configuration
    nconf.argv()
        .env()
        .file({ file: './nconf/config.json' });


    //Configure SocketIo Channel.
    var socket_client;
    var socketio_path = nconf.get('socketio_path')
    if(room_id && socketio_path){
        console.log('SocketIO Enabled.', socketio_path)
        socket_client = socketio.connect(socketio_path);
        socket_client.on('connect', function() {
            socket_client.emit('join', room_id);
        });
        socket_client.on('message', function(msg) {
            console.log('[BANDIT-WEB]: '+ msg)

            //Parse the message, checking for message types that are important to us. This parsing will be done by Angular in the future.
        });
    }
    else{
        console.log('SocketIO disabled.', room_id, socketio_path)
        socket_client = {};
        socket_client.emit = function(){}
    }



    var scriptElm = "\n<script type='text/javascript' src='jquery.min.1.2.js'></script>\n";
    var response_info = {
        injectable: false,
        recordable: true,
        gzipped: false,
        deflated: false,
        content_encoding: '',
        content_type: '',
        request_start_time:0,
        request_end_time: 0
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
        response_info.content_encoding = response.headers['content-encoding'] || ''
        response_info.gzipped = (response_info.content_encoding == 'gzip')
        response_info.deflated = (response_info.content_encoding == 'deflate')

        response_info.content_type = response.headers['content-type'] || "text/html";

        //check if response if injectable
        response_info.injectable = (response_info.content_type.indexOf('text/html') !== -1);

        //check if response is recordable
        response_info.recordable = is_recordable(response_info.content_type)
        //console.log(response_opts)
    }

    this.handle_request = function (request, req_url) {
        url = req_url;
        //console.log("[" + url.hostname + url.pathname + "] - Processor request event, url: " + URL.format(req_url));
        //console.log('Request Headers', request.headers)
        socket_client.emit('message', {room_id : _room_id, resource_id: _resource_id, message_type: "REQUEST_HEADER", payload: request.headers});
    }

    this.handle_response = function (response) {
        //console.log("[" + url.hostname + url.pathname + "] - Processor response event, response server header: " + response.headers.server);
        //console.log('Response Headers', response.headers)
        parse_response_header(response)

        if(response_info.injectable){
            //calculate new response header here.
            response.headers['content-length'] = parseInt(response.headers['content-length']) + scriptElm.length;
            //console.log(response.headers['content-length']);
        }
        socket_client.emit('message', {room_id : _room_id, resource_id: _resource_id, message_type: "RESPONSE_HEADER", payload: {response_header: response.headers, response_info: response_info}});
    }

    this.handle_response_data = function (data) {
        //console.log("[" + url.hostname + url.pathname + "] - Processor response data event, length: " + data.length);

        if (response_info.recordable || response_info.injectable) {
            //the response is recordable or injectable, that means you should store the data being sent and do something with
            //it later
            bufs.push(data);
            return null; //dont output anything to be sent to the user yet.
        }
        return data;

    }

    this.handle_response_end = function () {
        //console.log("[" + url.hostname + url.pathname + "] - Processor response end event");
        if (response_info.recordable || response_info.injectable) {

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
            if (response_info.injectable) {

                console.log('inject the script');
                response_str = response_str.replace(/(<head[^>]*>)/, "$1" + scriptElm)
                //console.log(response_str)
                socket_client.emit('message', {room_id : _room_id, resource_id: _resource_id, message_type: "RESPONSE_BODY", payload: response_str});
                return response_str
            }
            else {
                //not injectable, but recordable, so send a message here to the listeners then send the buffer to the waiting user
                socket_client.emit('message', {room_id : _room_id, resource_id: _resource_id, message_type: "RESPONSE_BODY", payload: response_str});
                return buf;
            }
        }
        return null;
    }
};

// Proxy
new Proxy({proxy_port: process.env.PORT ||8080, verbose: false}, simpleProcessor);
