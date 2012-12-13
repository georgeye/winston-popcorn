var dgram = require("dgram");
var server = dgram.createSocket("udp4");
var fs = require('fs');
var Schema = require('protobuf').Schema;

var schema = new Schema(fs.readFileSync('./lib/popcorn.desc'));
  // The "PopcornMsg" message.
var PopcornMsg = schema['popcornMsg.PopcornMsg'];

server.on("message", function (msg, rinfo) {
  var message = PopcornMsg.parse(msg);
  console.log("server got: " + JSON.stringify(message));
});

server.on("listening", function () {
  var address = server.address();
  console.log("server listening " +
      address.address + ":" + address.port);
});

server.bind(41234);
