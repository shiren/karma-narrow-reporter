'use strict';

require('colors');

var NarrowReporter = function(baseReporterDecorator, formatError) {
    var self = this;

    baseReporterDecorator(this);

    function writeSpecHeader(browser) {
        self.write('\n' + browser + ' failed specs:\n'.red);
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
            var item = formatError(log).split('\n');
            var errorDescription = item[0];
            var stacktrace = item[1];

            //remove browserify virtual path
            if (stacktrace.indexOf(' <- ') !== -1) {
                stacktrace = stacktrace.split(' <- ');
                stacktrace = ' at ' + stacktrace[stacktrace.length - 1];
            }

            self.write((errorDescription + '\n').magenta);
            self.write((stacktrace + '\n').grey);
        });
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
