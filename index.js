require('colors');

var NarrowReporter = function(baseReporterDecorator, formatError) {
  baseReporterDecorator(this);

  this.currentSuite = [];
  this.onSpecComplete = function(browser, result) {
        if (result.success === false) {
            this.write('\n' + browser + ' failed specs:\n'.red);
            result.suite.forEach((function(value, index) {
                    if(index === 0) {
                        this.write('  ');
                    }
                    this.write((value + ' >\n').blue);
            }).bind(this));

            // Write descrition and error to the list.
            this.write(('  ' + result.description + '\n').yellow);

            var msg = '';

            result.log.forEach(function(log) {
                msg += formatError(log, '\n');
            });

            this.write(msg + '\n\n');
        }
  };

  this.onRunComplete = function(browsers, results) {
      this.write('==> ');
      this.write((results.success + '/' + (results.success + results.failed)).green);
      this.write(('(' + results.failed + ')').red);
      this.write('\n');
  };
};

NarrowReporter.$inject = ['baseReporterDecorator', 'formatError'];

module.exports = {
  'reporter:narrow': ['type', NarrowReporter]
};
