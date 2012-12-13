var winston = require('winston');
require('./lib/winston-popcorn').Popcorn;

winston.add(winston.transports.Popcorn, {level: 'info', host: '127.0.0.1', port: 41234});
winston.error("test 5");
