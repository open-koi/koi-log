"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var fs_1 = require("fs");
var path_1 = require("path");
var js_sha256_1 = require("js-sha256");
var cryptoRandomString = require("crypto-random-string");
var node_cron_1 = require("node-cron");
var middleware_1 = require("./middleware");
var logFileLocation = path_1["default"].join(__dirname, '../../daily.log');
var rawLogFileLocation = path_1["default"].join(__dirname, '../../access.log');
function getLogSalt() {
    return js_sha256_1.sha256(cryptoRandomString({ length: 10 }));
}
exports.joinKoi = function (app) {
    app.use(middleware_1["default"]);
    app.get("/logs", exports.koiLogsHelper);
    exports.koiLogsDailyTask(); // start the daily log task
};
exports.koiLogsHelper = function (req, res) {
    // console.log('logs file path is ', logFileLocation)
    fs_1["default"].readFile(logFileLocation, 'utf8', function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send(err);
            return;
        }
        // console.log(data)
        res.status(200).send(data);
    });
};
exports.koiLogsDailyTask = function () {
    return node_cron_1["default"].schedule('0 0 * * *', function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('running the log cleanup task once per day on ', new Date());
                        return [4 /*yield*/, exports.logsTask()];
                    case 1:
                        result = _a.sent();
                        console.log('daily log task returned ', result);
                        return [2 /*return*/];
                }
            });
        });
    });
};
exports.logsTask = function () {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var masterSalt, rawLogs, sorted, result, err_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 5, , 6]);
                                masterSalt = getLogSalt();
                                return [4 /*yield*/, readRawLogs(masterSalt)];
                            case 1:
                                rawLogs = _a.sent();
                                return [4 /*yield*/, sortAndFilterLogs(rawLogs)];
                            case 2:
                                sorted = _a.sent();
                                return [4 /*yield*/, writeDailyLogs(sorted)];
                            case 3:
                                result = _a.sent();
                                // last, clear old logs
                                return [4 /*yield*/, clearRawLogs()];
                            case 4:
                                // last, clear old logs
                                _a.sent();
                                resolve(result);
                                return [3 /*break*/, 6];
                            case 5:
                                err_1 = _a.sent();
                                console.error('error writing daily log file', err_1);
                                reject(err_1);
                                return [3 /*break*/, 6];
                            case 6: return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
};
/*
  @readRawLogs
    retrieves the raw logs and reads them into a json array
*/
function readRawLogs(masterSalt) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var logs = fs_1["default"].readFileSync(rawLogFileLocation).toString().split("\n");
                    var prettyLogs = [];
                    for (var _i = 0, logs_1 = logs; _i < logs_1.length; _i++) {
                        var log = logs_1[_i];
                        try {
                            if (log && !(log === " ") && !(log === "")) {
                                try {
                                    var logJSON = JSON.parse(log);
                                    logJSON.uniqueId = js_sha256_1.sha256(logJSON.url);
                                    logJSON.address = js_sha256_1.sha256.hmac(masterSalt, logJSON.address);
                                    prettyLogs.push(logJSON);
                                }
                                catch (err) {
                                    console.error('error reading json', err);
                                    reject(err);
                                }
                            }
                            else {
                                console.error('tried to parse log, but skipping because log is ', log);
                                reject({});
                            }
                        }
                        catch (err) {
                            console.error('err', err);
                            reject(err);
                        }
                    }
                    resolve(prettyLogs);
                })];
        });
    });
}
/*
  @readRawLogs
    retrieves the raw logs and reads them into a json array
*/
function writeDailyLogs(logs) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var data = {
                        lastUpdate: new Date(),
                        summary: new Array()
                    };
                    for (var key in logs) {
                        var log = logs[key];
                        if (log && log.addresses) {
                            data.summary.push(log);
                        }
                    }
                    fs_1["default"].writeFile(logFileLocation, JSON.stringify(data), {}, function (err) {
                        if (err) {
                            console.log('ERROR SAVING ACCESS LOG', err);
                            resolve({ success: false, logs: data, error: err });
                        }
                        else {
                            resolve({ success: true, logs: data });
                        }
                    });
                })];
        });
    });
}
/*
  @sortAndFilterLogs
    logs - access.log output (raw data in array)
    resolves to an array of data payloads
*/
function sortAndFilterLogs(logs) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var formatted_logs = [];
                    try {
                        for (var _i = 0, logs_2 = logs; _i < logs_2.length; _i++) {
                            var log = logs_2[_i];
                            if (log.url && log.uniqueId) {
                                if (formatted_logs[log.uniqueId] && !formatted_logs[log.uniqueId].addresses.includes(log.address)) {
                                    formatted_logs[log.uniqueId].addresses.push(log.address);
                                }
                                else {
                                    formatted_logs[log.uniqueId] = {
                                        addresses: [log.address],
                                        url: log.url
                                    };
                                }
                            }
                        }
                        resolve(formatted_logs);
                    }
                    catch (err) {
                        reject(err);
                    }
                })];
        });
    });
}
/*
  @clearRawLogs
    removes the old access logs file
*/
function clearRawLogs() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    fs_1["default"].truncate(rawLogFileLocation, 0, function () {
                        resolve(true);
                    });
                })];
        });
    });
}
