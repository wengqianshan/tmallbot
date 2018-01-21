var express = require('express');
var path = require('path');
var http = require('http');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// tmallbot start ===============================================
var oauth = require('./oauth');

var S = null;

app.get('/oauth/authorize', oauth.authorize);
app.post('/oauth/token', oauth.grantToken);
app.post('/api/test', oauth.apiEndpoint);

app.post('/tmall', function (req, res, next) {
  console.log(req.body)
  if (S) {
    S.emit('light', req.body);
  }
  var json = {
    "header": {
      "namespace": "AliGenie.Iot.Device.Discovery",
      "name": "DiscoveryDevicesResponse",
      "messageId": req.body.header.messageId,
      "payLoadVersion": 1
    },
    "payload": {
      "devices": [{
        "deviceId": "34ea34cf2e63",
        "deviceName": "light1",
        "deviceType": "light",
        "zone": "",
        "brand": "",
        "model": "",
        "icon": "http://img.alicdn.com/top/i1/LB1VWxkblDH8KJjSspnXXbNAVXa",
        "properties": [{
          "name": "color",
          "value": "Red"
        }],
        "actions": [
          "TurnOn",
          "TurnOff",
          "SetBrightness",
          "AdjustBrightness",
          "SetTemperature",
          "Query"          //  查询的也请返回
        ],
        "extensions": {
          "extension1": "",
          "extension2": ""
        }
      }]
    }
  };
  res.json(json)
});

// tmallbot stop =================================================

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


var port = process.env.PORT || '7000';
app.set('port', port);

var server = http.createServer(app);

// socket.io start =======================================

var io = require('socket.io')(server);
io.on('connection', function (socket) {
  S = socket;
  console.log('socket客户端已连接')
  // socket.emit('news', { hello: 'world' });
  // socket.on('my other event', function (data) {
  //   console.log(data);
  // });
});

// socket.io stop =============================================

server.listen(port);
// server.on('error', onError);
server.on('listening', function() {
  console.log('listen: ' + port)
});