# Metrics
Metrics is a reporting framework for data point information (measurements and time series) to aggregators such as [Graphite](https://graphiteapp.org/)

![Node.js Publish to NPM](https://github.com/ysa23/metrics-js/workflows/Node.js%20Publish%20to%20NPM/badge.svg)

## Highlights
* Time series reporting
* Support plugable reporters
* Built in reporters:
	* Graphite
	* String
	* Console
	* InMemory (for testing)
* Simple, easy to use API

## Getting started
### Installation
[![npm (scoped)](https://img.shields.io/npm/v/metrics-reporter.svg)](https://www.npmjs.com/package/metrics-reporter)

### Configuration
Import metrics package:
```js
const Metrics = require('metrics-reporter').Metrics;
```
Initialize the metrics instance with the required reporters:
```js
const stringReporter = new require('metrics-reporter').StringReporter(metricString => {
	// Do something
});
const consoleReporter = new require('metrics-reporter').ConsoleReporter();

const metrics = new Metrics([stringReporter, consoleReporter], errorHandler);
```

### Reporting execution time
Use the `Metrics` instance to report execution time of a function:
```js
metrics.space('users.get').meter(function(userIds, callback) {
	// read users from database
	callback(...);
});
```
* You may use the `space` function to define the namespace key that will be used to aggregate the time
* when you wish to meter a function, use the `meter` function and pass a function with you code into it. the meter function will run your code, while measuring the time it took to execute, and report it to the configured reporters 

Note that the metrics is reported only **after** the callback is called.

### Reporters
Metrics comes with several built-in reporters
#### Graphite
Reports metrics to a graphite server:
```js
const metrics = require('metrics-reporter').Metrics;

const graphiteHost = '1.1.1.1'; // Graphite server IP address
const graphitePort = 2003; // Optional - port number. Defaults to 2003
const spacePrefix = 'My.Project'; // Optional - prefix to all metrics spaces

const graphiteReporter = new require('metrics-reporter').GraphiteReporter({
		host: graphiteHost,
		port: graphitePort,
		prefix: spacePrefix
	});

const metrics = new Metrics([graphiteReporter], errorHandler);
```

#### Console
Console reporter comes in handy when you need to debug metrics calls:
```js
const Metrics = require('metrics-reporter').Metrics;

const consoleReporter = new require('metrics-reporter').ConsoleReporter();
	
const metrics = new Metrics([consoleReporter], errorHandler);
```
When a metrics will be reported, a message will appear in the terminal, that includes the key and the value reported.

#### String
```js
const Metrics = require('metrics-reporter').Metrics;
const fs = require('fs');

const stringReporter = new require('metrics-reporter').StringReporter(metricString => {
	fs.appendFile('metrics.log', metricsString);
});
	
const metrics = new Metrics([stringReporter], errorHandler);
```
Here, `StringReporter` is used to build a log file from the metrics reports.

#### InMemory
InMemoryReporter can be used for testing purposed, in order to make sure your code reports metrics as expected.
```js
const Metrics = require('metrics-reporter').Metrics;

const metricsStorage = [];

const memoryReporter = new require('metrics-reporter').InMemoryReporter(metricsStorage);
	
const metrics = new Metrics([memoryReporter], errorHandler);
```
When a metric is reported, an object with `key` and `value` properties is pushed to the array.<br/>
Then, the array can be used in order to validate the report.

### Building new reporters
Metrics support creating new reports acccording to an application needs.

A reporter must contain a method called `report`. The method gets the reported `key` and `value`. 

For example, lets see how to implement a reporter for redis:
```js
const client = require('redis').createClient();

module.exports = function RedisReporter(channel) {
  this.report = function(key, value) {
    client.publish(channel, JSON.stringify({ key: key, value: value }));
  }
};
```
The new reporter will publish a message to a specified channel in redis when a metric is reported.

## Development

### How to contribute
We encourage contribution via pull requests on any feature you see fit.

When submitting a pull request make sure to do the following:
* Run all unit and integration tests to ensure no existing functionality has been affected
* Write unit or integration tests to test your changes. All features and fixed bugs must have tests to verify they work
Read [GitHub Help](https://help.github.com/articles/about-pull-requests/) for more details about creating pull requests

### Running tests
To run tests, in command line simply run `npm test`
