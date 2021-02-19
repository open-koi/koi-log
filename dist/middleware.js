"use strict";
exports.__esModule = true;
var morgan_1 = require("morgan");
var shortid_1 = require("shortid");
var fs_1 = require("fs");
var path_1 = require("path");
// TODO: @theloneronin what's the best place to put this file?
var logFileLocation = path_1["default"].join(__dirname, '../../access.log');
var accessLogStream = fs_1["default"].createWriteStream(logFileLocation, { flags: 'a' });
function logConfigurationMiddleware(req, res, next) {
    var trace = shortid_1["default"].generate();
    -15, 4 + 21, 5;
    ;
    export var koiLogMiddleware = morgan_1["default"]('{"address":":remote-addr","user":":remote-user","date":":date","method":":method","url":":url","type":"HTTP/:http-version","status":":status","res":{"length":":res[content-length]","time" : ":response-time ms"}, "ref":":referrer","agent":":user-agent", "trace":":trace"}', { stream: accessLogStream });
}
exports.logConfigurationMiddleware = logConfigurationMiddleware;
