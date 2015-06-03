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
                stacktrace = parsedLog.stacktrace;

            //remove browserify virtual path
            if (stacktrace.indexOf(' <- ') !== -1) {
                stacktrace = stacktrace.split(' <- ');
                stacktrace = ' at ' + stacktrace[stacktrace.length - 1];
            }

            self.write((parsedLog.assertion).white);
            self.write((parsedLog.errorMsg).white);
            self.write((stacktrace + '\n').grey);
        });
    }

    function logParsing(log) {
        var item, errorDescription, stacktrace, assertion, errorMsg;
        var ErrorTypes = ['TypeError', 'ReferenceError:', 'RangeError:', 'SyntaxError:', 'URIError:', 'EvalError:', 'Error:'];

        item = formatError(log).split('    at');
        errorDescription = item[0];
        assertion = item[0];
        stacktrace = item[1];

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
