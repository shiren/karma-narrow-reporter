'use strict';

require('colors');

var NarrowReporter = function(baseReporterDecorator, formatError, config) {
    var self = this;
    var browserLength, skipLog;

    var nrConfig = Object.assign({
        showSuccess: false,
        stopOnFirstFail: false
    }, config.narrowReporter);

    baseReporterDecorator(this);

    function writeSpecHeader(browser, isSuccess) {
        if (isSuccess) {
            self.write(('[O]').green);
        } else {
            self.write(('[X]').red);
        }
    }

    function writeSpecSuitePath(suite) {
        suite.forEach(function(value) {
            self.write((value + ' >\n').blue.underline);
        });
    }

    function writeSpecItDesc(result) {
        self.write(('"' + result.description + '"').yellow);
    }

    function writeSpecErrorLog(logs) {
        logs.forEach(function(log) {
            var parsedLog = logParsing(log);

            if (parsedLog.errorMsg) {
                self.write('\n' + (JSON.stringify(parsedLog.errorMsg.replace(/\n$/g, '')).replace(/\"/g, '')).white);
            }

            if (parsedLog.assertion) {
                self.write('\n' + (parsedLog.assertion).white);
            }

            if (parsedLog.stacktrace) {
                self.write('\n' + (parsedLog.stacktrace).grey);
            }
        });
    }

    function logParsing(log) {
        var item, errorDescription, stacktrace, assertion, errorMsg;
        var ErrorTypes = ['TypeError', 'ReferenceError:', 'RangeError:', 'SyntaxError:', 'URIError:', 'EvalError:', 'Error:'];

        item = formatError(log).split('\n');

        errorDescription = item.shift();
        assertion = errorDescription;

        stacktrace = '';

        item.forEach(function(stLine) {
            if (!stLine) {
                return;
            }

            if (stLine.indexOf(' <- ') !== -1) {
                stLine = stLine.split(' <- ');
                stLine = stLine[stLine.length - 1];
            }

            stacktrace += ' @' + stLine + '\n';
        });

        ErrorTypes.forEach(function(error) {
            if (errorDescription.indexOf(error) !== -1) {
                errorDescription = errorDescription.split(error);
                assertion = errorDescription[0];
                errorMsg = error + errorDescription[1];
            }
        });

        return {
            assertion: assertion || '',
            errorMsg: errorMsg || '',
            stacktrace: stacktrace.replace(/\n$/g, '') || ''
        };
    }


    function writeTestResult(browsers) {
        browsers.forEach(function(browser) {
            var result = browser.lastResult;
            var resultMsgIntro = '\n==> ';

            if (browsers.length > 1) {
                resultMsgIntro += browser + ' ';
            }

            self.write(resultMsgIntro);
            self.write((result.success + '/' + (result.success + result.failed)).green);

            if (result.failed) {
                self.write(('(' + result.failed + ')').red);
            }

            self.write(' ' + getDateWithFormat());
        });
    }

    function getDateWithFormat() {
        var currentdate = new Date(),
            year = currentdate.getFullYear(),
            month = getFixedDecimal(currentdate.getMonth()),
            date = getFixedDecimal(currentdate.getDate()),
            hour = getFixedDecimal(currentdate.getHours()),
            min = getFixedDecimal(currentdate.getMinutes());

        return [year, month, date].join('-') + ' ' + [hour, min].join(':');
    }

    function getFixedDecimal(number) {
        return number < 9 ? '0' + number : number;
    }

    this.onSpecComplete = function(browser, result) {
        if (skipLog) {
            return;
        }

        if (!result.success) {
            if (nrConfig.stopOnFirstFail) {
                skipLog = true;
            }

            this.write('\n');
            writeSpecHeader(browser, result.success);
            writeSpecSuitePath(result.suite);
            writeSpecItDesc(result);
            writeSpecErrorLog(result.log);
        } else if(nrConfig.showSuccess && !result.skipped) {
            this.write('\n');
            writeSpecHeader(browser, result.success);
            writeSpecSuitePath(result.suite);
            writeSpecItDesc(result);
        }
    };

    this.onRunComplete = function(browsers, results) {
        writeTestResult(browsers, results);
        this.write('\n');
    };

    this.onBrowserStart = function(browser) {
        this.write('\n...' + browser + ' start...\n');
    };

    this.onBrowserLog = function(browser, log, type) {
        var blog = '\n[' + type.toUpperCase() + '] ';

        if (browserLength > 1) {
            blog +=  browser.name + ': ';
        }

        blog += log;

        this.write(blog);
    };

    this.onRunStart = function(bc) {
        skipLog = false;
        browserLength = bc.length;
    };
};

NarrowReporter.$inject = ['baseReporterDecorator', 'formatError', 'config'];

module.exports = {
    'reporter:narrow': ['type', NarrowReporter]
};
