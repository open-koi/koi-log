"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logsTask = exports.koiLogsDailyTask = exports.koiLogsHelper = exports.joinKoi = void 0;
const fs = __importStar(require("fs"));
const js_sha256_1 = require("js-sha256");
const cryptoRandomString = require("crypto-random-string");
const node_cron_1 = __importDefault(require("node-cron"));
const middleware_1 = require("./middleware");
const tmp_1 = __importDefault(require("tmp"));
// these will be populated when the library is instantiated
var logFileLocation;
var rawLogFileLocation;
var proofFileLocation;
function setDefaults() {
    logFileLocation = "";
    rawLogFileLocation = "";
    proofFileLocation = "";
}
function getLogSalt() {
    return js_sha256_1.sha256(cryptoRandomString({ length: 10 }));
}
const joinKoi = function (app) {
    return __awaiter(this, void 0, void 0, function* () {
        setDefaults();
        yield generateLogFiles();
        const koiMiddleware = yield middleware_1.generateKoiMiddleware(logFileLocation);
        app.use(koiMiddleware);
        app.get("/logs", exports.koiLogsHelper);
        exports.koiLogsDailyTask(); // start the daily log task
    });
};
exports.joinKoi = joinKoi;
const koiLogsHelper = function (req, res) {
    // console.log('logs file path is ', logFileLocation)
    fs.readFile(logFileLocation, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send(err);
            return;
        }
        // console.log(data)
        res.status(200).send(data);
    });
};
exports.koiLogsHelper = koiLogsHelper;
const koiLogsDailyTask = function () {
    return node_cron_1.default.schedule('0 0 * * *', function () {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('running the log cleanup task once per day on ', new Date());
            var result = yield exports.logsTask();
            console.log('daily log task returned ', result);
        });
    });
};
exports.koiLogsDailyTask = koiLogsDailyTask;
const logsTask = function () {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                var masterSalt = getLogSalt();
                // then get the raw logs
                var rawLogs = yield readRawLogs(masterSalt);
                var sorted = yield sortAndFilterLogs(rawLogs);
                var result = yield writeDailyLogs(sorted);
                // last, clear old logs
                yield clearRawLogs();
                resolve(result);
            }
            catch (err) {
                console.error('error writing daily log file', err);
                reject(err);
            }
        }));
    });
};
exports.logsTask = logsTask;
/*
  @readRawLogs
    retrieves the raw logs and reads them into a json array
*/
function readRawLogs(masterSalt) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            var logs = fs.readFileSync(rawLogFileLocation).toString().split("\n");
            var prettyLogs = [];
            for (var log of logs) {
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
        });
    });
}
/*
  @readRawLogs
    retrieves the raw logs and reads them into a json array
*/
function writeDailyLogs(logs) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
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
            fs.writeFile(logFileLocation, JSON.stringify(data), {}, function (err) {
                if (err) {
                    console.log('ERROR SAVING ACCESS LOG', err);
                    resolve({ success: false, logs: data, error: err });
                }
                else {
                    resolve({ success: true, logs: data });
                }
            });
        });
    });
}
function generateLogFiles() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                // create three files (access.log, daily.log, and proofs.log) with names corresponding to the date
                var date = new Date();
                var names = [
                    date.toISOString().slice(0, 10) + '-access.log',
                    date.toISOString().slice(0, 10) + '-daily.log',
                    date.toISOString().slice(0, 10) + '-proofs.log',
                ];
                let paths = [];
                for (var name of names) {
                    try {
                        var path = yield createLogFile(name);
                        paths.push(path);
                    }
                    catch (err) {
                        reject(err);
                    }
                }
                console.log('created paths', paths, paths[0]);
                // set the log file names in global vars
                // sloppy, needs to move to cleaner OOP
                logFileLocation = paths[0];
                rawLogFileLocation = paths[1];
                proofFileLocation = paths[2];
                // return their file names to the caller
                resolve(paths);
            }
            catch (err) {
                reject(err);
            }
        }));
    });
}
/*
  generate the log files
*/
function createLogFile(name) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            // resolve('/tmp/' + name as string)
            tmp_1.default.file(function _tempFileCreated(err, path, fd) {
                if (err)
                    reject(err);
                console.log('fd', fd);
                console.log('File: ', path);
                resolve(path);
            });
        }));
    });
}
/*
  @sortAndFilterLogs
    logs - access.log output (raw data in array)
    resolves to an array of data payloads
*/
function sortAndFilterLogs(logs) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            var formatted_logs = [];
            try {
                for (var log of logs) {
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
        }));
    });
}
/*
  @clearRawLogs
    removes the old access logs file
*/
function clearRawLogs() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fs.truncate(rawLogFileLocation, 0, function () {
                resolve(true);
            });
        });
    });
}
//# sourceMappingURL=index.js.map