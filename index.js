'use strict';

require('colors');

var NarrowReporter = function(baseReporterDecorator, formatError) {
    var self = this;

    baseReporterDecorator(this);

    function writeSpecHeader(browser) {
        self.write(('--Failed in ' + browser + '--\n').red);
    }

    function writeSpecSuitePath(suite) {
        suite.forEach(function(value) {
            self.write((value + ' >\n').blue.underline);
        });
    }

    function writeSpecItDesc(result) {
        self.write(('"' + result.description + '"' + '\n').yellow);
    }

    function writeSpecErrorLog(logs) {
        logs.forEach(function(log) {
            var parsedLog = logParsing(log),
                stacktraces = '';

            //remove browserify virtual path
            parsedLog.stacktrace.forEach(function(stline) {
                if (stline.indexOf(' <- ') !== -1) {
                    stline = stline.split(' <- ');
                    stline = stline[stline.length - 1];
                }

                stacktraces += ' at ' + stline;
            });

            if (parsedLog.errorMsg) {
                self.write((JSON.stringify(parsedLog.errorMsg.replace(/\n$/g, '')).replace(/\"/g, '') + '\n').white);
            }

            self.write((parsedLog.assertion).white);
            self.write(stacktraces.grey);
        });
    }

    function logParsing(log) {
        var item, errorDescription, stacktrace, assertion, errorMsg;
        var ErrorTypes = ['TypeError', 'ReferenceError:', 'RangeError:', 'SyntaxError:', 'URIError:', 'EvalError:', 'Error:'];

        item = formatError(log).split('    at');

        errorDescription = item.shift();
        assertion = errorDescription;
        stacktrace = item;

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
            stacktrace: stacktrace || ''
        };
    }

    function writeTestResult(browsers) {
        browsers.forEach(function(browser) {
            var result = browser.lastResult;

            self.write('==> ' + browser + ' ');
            self.write((result.success + '/' + (result.success + result.failed)).green);

            if (result.failed) {
                self.write(('(' + result.failed + ')').red);
            }

            self.write(' ' + getDateWithFormat());
            self.write('\n');
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
        if (result.success === false) {
            writeSpecHeader(browser);
            writeSpecSuitePath(result.suite);
            writeSpecItDesc(result);
            writeSpecErrorLog(result.log);
        }
    };

    this.onRunComplete = function(browsers, results) {
        writeTestResult(browsers, results);
        this.write('\n');
    };
};

NarrowReporter.$inject = ['baseReporterDecorator', 'formatError'];

module.exports = {
    'reporter:narrow': ['type', NarrowReporter]
};
