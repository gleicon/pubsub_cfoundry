// gleicon 2010 | http://zenmachine.wordpress.com | http://github.com/gleicon


var http = require("http")
var qs = require("querystring")
var url = require("url")
var fs = require('fs')
var express = require('express')
var events = require('events')

var app = express.createServer(express.logger())
var presence = new Array();
app.use(express.bodyParser());
app.use(express.static(__dirname + '/static'));

process.on('uncaughtException', function (err) {
  console.log('exception: ' + err)
});

app.get('/:file', function(req, res){res.sendfile('static/' + req.params.file)});
app.get('/c/:route', function(req, res){
  l = function(m) { res.write(m + '\n'); } 
  route = req.params.route
  req.connection.setTimeout(0)
  res.header('Content-type', 'text/plain')
  if (presence[route] == null) { presence[route] = new events.EventEmitter() }
  presence[route].addListener('comet_message', l)
})

app.get('/e/:route', function(req, res){ 
  route = req.params.route
  l = function(m) { 
    res.write('id: '+ route + '\n'); 
    res.write('data: '+ m + '\n\n'); 
  } 
  res.header('Content-Type', 'text/event-stream')
  res.header('Cache-Control', 'no-cache')
  res.header('Connection', 'keep-alive')
  res.header('Transfer-Encoding', '')
  if (presence[route] == null) { 
    presence[route] = new events.EventEmitter() 
  }
  presence[route].addListener('sse_message', l)
})

app.post('/:route', function(req, res){
  route = req.params.route
  if (presence[route] == null) {
    res.send('route '+ route+ ' doesnt exists', 404)
  } else {
      if (presence[route] != null)  {
          presence[route].emit('comet_message', req.body.body) 
          presence[route].emit('sse_message', req.body.body)
      }
  }
  res.send('message posted\n');
})
                                        
var port = process.env.VMC_APP_PORT || 8001;
app.listen(port, function() {});
