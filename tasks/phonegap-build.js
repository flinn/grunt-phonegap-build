(function () {
  'use strict';

  var needle = require("needle");
  
  function start(taskRefs) {
    try {
      triggerBuild(taskRefs, responseHandler);
    } catch (err) {
      taskRefs.log.fail(err.message);
    }
  }

  function triggerBuild(taskRefs, callback) {
    var config = { };
    var baseUrl = 'https://build.phonegap.com/api/v1/apps/';
    var appID = taskRefs.options.appId;
    var data = { data: { pull: true } };

    var buildUrl = baseUrl + appID + '?token=' + taskRefs.options.user.token;

    taskRefs.log.ok("Starting upload");
    
    needle.put(buildUrl, data, config, callback);
  }

  function responseHandler(error, resp, body) {
    if (!err && (resp.statusCode >= 200 && resp.statusCode < 400)) {
      taskRefs.log.ok(name + " successful (HTTP " + resp.statusCode + ")");
      success(resp, body);
    } else if (err) {
      taskRefs.log.fail(name + " failed:");
      taskRefs.log.error("Message: " + err);
      error(new Error(err));
    } else {
      taskRefs.log.fail(name + " failed (HTTP " + resp.statusCode + ")");
      taskRefs.log.error("Message: " + body.error);
      error(new Error(body.error));
    }
  }
  
  module.exports = function (grunt) {
    grunt.registerMultiTask("phonegap_build", "Creates a ZIP archive and uploads it to build.phonegap.com to create a new build", function (args) {
      var opts = this.options({
        timeout: 60000,
        pollRate: 15000
      });

      var done = this.async(),
          taskRefs = {
            log: grunt.log, options: opts, done: done,
            needle: null /* wrapped version added in start */
          };

      if (!opts.user.token) {
        taskRefs.log.error("You must specify a token for authentication with the phonegap build API!");
      } else {
        start(taskRefs);
      }
    });
  };

}());