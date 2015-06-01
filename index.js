'use strict';

require('colors');

var NarrowReporter = function(baseReporterDecorator, formatError) {
    baseReporterDecorator(this);

    this.onSpecComplete = function(browser, result) {
        if (result.success === false) {
            this.write('\n' + browser + ' failed specs:\n'.red);

            result.suite.forEach((function(value) {
                this.write((value + ' >\n').blue.underline);
            }).bind(this));

            // Write descrition and error to the list.
            this.write(('"' + result.description + '"' + '\n').yellow);

            result.log.forEach((function(log) {
                var item = formatError(log).split('\n');
                var errorDescription = item[0];
                var stacktrace = item[1];

                //remove browserify virtual path
                if (stacktrace.indexOf(' <- ') !== -1) {
                    stacktrace = stacktrace.split(' <- ');
                    stacktrace = ' at ' + stacktrace[stacktrace.length - 1];
                }

                this.write((errorDescription + '\n').magenta);
                this.write((stacktrace + '\n').grey);
            }).bind(this));
        }
    };

    this.onRunComplete = function(browsers, results) {
        this.write('==> ');
        this.write((results.success + '/' + (results.success + results.failed)).green);

        if (results.failed) {
            this.write(('(' + results.failed + ')').red);
        }

        this.write((' ' + new Date()));
        this.write('\n\n');
    };
};

NarrowReporter.$inject = ['baseReporterDecorator', 'formatError'];

module.exports = {
    'reporter:narrow': ['type', NarrowReporter]
};
