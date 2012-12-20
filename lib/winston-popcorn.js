var util = require('util'),
  os = require('os'),
  fs = require('fs'),
  Schema = require('protobuf').Schema;

var dgram = require("dgram");
var schema = new Schema(fs.readFileSync(getPath(__filename) + 'popcorn.desc'));
// The "PopcornMsg" message.
var PopcornMsg = schema['popcornMsg.PopcornMsg'];

var Popcorn = exports.Popcorn = function(winston, options) {
  winston.Transport.call(this, options);
  this.name = 'popcon_transport';
  options = options || {};
  this.level = options.level || 'error';
  this.host = options.host || '127.0.0.1';
  this.port = options.port || 9125;
  this.node = os.hostname();
  this.node_role = "no_role";
  this.node_version = "no_version";
  var sock = dgram.createSocket("udp4");
  this.sock = sock;
  util.inherits(Popcorn, winston.Transport);
  winston.transports.Popcorn = Popcorn;
};

// Inherit from `winston.Transport` so you can take advantage
// of the base functionality and `.handleExceptions()`.
//

Popcorn.prototype.send = function(msg) {
  var buffer = new Buffer(msg);
  this.sock.send(buffer, 0, buffer.length, this.port, this.host);
};

Popcorn.prototype.log = function (level, msg, meta, callback) {
  //
  // Store this message and metadata, maybe use some custom logic
  // then callback indicating success.
  //
  Msg = {node: this.node, nodeRole: this.node_role, nodeVersion: this.node_version,
         level: get_popcorn_level(level), message: msg};
  if(meta && meta.module) Msg.module = meta.module;
  if(meta && meta.funcName) Msg.funcName = meta.funcName;
  if(meta && meta.line) Msg.line = meta.line;
  if(meta && meta.pid) Msg.pid = meta.pid;
  var raw = PopcornMsg.serialize(Msg);
  this.send(raw);
  callback(null, true);
};

function getPath(fileName) {
  var index = fileName.lastIndexOf('/');
  var path = fileName.substr(0, index+1);
  return path;
}

function get_popcorn_level(level) {
  if(level == "error") return 3;
  else if(level == "debug") return 7;
  else if(level == "warn") return 4;
  else return 6;
}
