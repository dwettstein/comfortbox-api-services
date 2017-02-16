'use strict';

module.exports = function(ComfortBox) {
  var allowedTimeUnits = ['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds', 'milliseconds'];
  var allowedAggregators = ['avg', 'count', 'dev', 'diff', 'div', 'first', 'gaps', 'last', 'least_squares', 'max', 'min', 'percentile', 'rate', 'sampler', 'save_as', 'scale', 'sum', 'trim'];

  /**
   * Display a message on a ComfortBox.
   *
   * @param {string} text Text to display on the ComfortBox
   * @param {Function(Error, response)} callback
   */
  ComfortBox.prototype.displayText = function(text, callback) {
    console.log('Called function displayText with param text: ' + text);

    var processResponse = function(error, response, body) {
      var result = processParticleResponse(error, response, body);
      callback(null, result);
    };

    console.log('Requesting Particle API with particleId: ' + this.particleId);
    ComfortBox.app.dataSources.ParticleAPI.displayText(this.particleId, text, processResponse);
  };

  /**
   * Check if the ComfortBox is connected to Particle Cloud.
   *
   * @param {Function(Error, response)} callback
   */
  ComfortBox.prototype.isOnline = function(callback) {
    console.log('Called function isOnline');

    var processResponse = function(error, response, body) {
      var result = processParticleResponse(error, response, body);
      var status = {id: result.id, name: result.name, connected: result.connected, lastHeard: result.last_heard, lastIp: result.last_ip_address};
      callback(null, status);
    };

    console.log('Requesting Particle API with particleId: ' + this.particleId);
    ComfortBox.app.dataSources.ParticleAPI.getDeviceInfo(this.particleId, processResponse);
  };

  /**
   * Display various LED colors on a ComfortBox.
   *
   * @param {string} colorsInBase64 Colors to display on the ComfortBox formatted in Base64
   * @param {Function(Error, response)} callback
   */
  ComfortBox.prototype.displayLed = function(colorsInBase64, callback) {
    console.log('Called function displayLed with param colorsInBase64: ' + colorsInBase64);

    var processResponse = function(error, response, body) {
      var result = processParticleResponse(error, response, body);
      callback(null, result);
    };

    console.log('Requesting Particle API with particleId: ' + this.particleId);
    ComfortBox.app.dataSources.ParticleAPI.displayLed(this.particleId, colorsInBase64, processResponse);
  };

  /**
   * Display a single LED color in HEX on a ComfortBox.
   *
   * @param {string} colorInHex Color to display on the ComfortBox formatted in HEX
   * @param {Function(Error, response)} callback
   */
  ComfortBox.prototype.displayHexColor = function(colorInHex, callback) {
    console.log('Called function displayHexColor with param colorInHex: ' + colorInHex);
    var base64Color = convertHexToBase64(colorInHex);
    var colorsInBase64 = multiplyBase64Color(base64Color, 24);

    var processResponse = function(error, response, body) {
      var result = processParticleResponse(error, response, body);
      callback(null, result);
    };

    console.log('Requesting Particle API with particleId: ' + this.particleId);
    ComfortBox.app.dataSources.ParticleAPI.displayLed(this.particleId, colorsInBase64, processResponse);
  };

  /**
   * Display the sensors data on the ComfortBox.
   *
   * @param {Function(Error, response)} callback
   */
  ComfortBox.prototype.displayData = function(callback) {
    console.log('Called function displayData');

    var processResponse = function(error, response, body) {
      var result = processParticleResponse(error, response, body);
      callback(null, result);
    };

    console.log('Requesting Particle API with particleId: ' + this.particleId);
    ComfortBox.app.dataSources.ParticleAPI.displayData(this.particleId, processResponse);
  };

  /**
   * Change the interval for sending messages from the ComfortBox to the MQTT queue.
   *
   * @param {string} interval Interval for sending messages from the ComfortBox to the MQTT queue
   * @param {Function(Error, response)} callback
   */
  ComfortBox.prototype.setInterval = function(interval, callback) {
    console.log('Called function setInterval with param interval: ' + interval);

    var processResponse = function(error, response, body) {
      var result = processParticleResponse(error, response, body);
      callback(null, result);
    };

    console.log('Requesting Particle API with particleId: ' + this.particleId);
    ComfortBox.app.dataSources.ParticleAPI.setInterval(this.particleId, interval, processResponse);
  };

  /**
   * Change the MQTT host used by a ComfortBox.
   *
   * @param {string} host IP or hostname of the MQTT message queue
   * @param {string} port Port of the MQTT message queue
   * @param {Function(Error, response)} callback
   */
  ComfortBox.prototype.setMqttHost = function(host, port, callback) {
    console.log('Called function setMqttHost with params host: ' + host + ', port: ' + port);

    var processResponse = function(error, response, body) {
      var result = processParticleResponse(error, response, body);
      callback(null, result);
    };

    console.log('Requesting Particle API with particleId: ' + this.particleId);
    ComfortBox.app.dataSources.ParticleAPI.setMqttHost(this.particleId, host, port, processResponse);
  };

  /**
   * Change if the ComfortBox should show the sensor's data regularly or not.
   *
   * @param {boolean} Boolean whether to show the data regularly or not (true or false)
   * @param {Function(Error, response)} callback
   */
  ComfortBox.prototype.setShowDataRegularly = function(doShowDataRegularly, callback) {
    console.log('Called function setShowDataRegularly with params doShowDataRegularly: ' + doShowDataRegularly);

    var processResponse = function(error, response, body) {
      var result = processParticleResponse(error, response, body);
      callback(null, result);
    };

    console.log('Requesting Particle API with particleId: ' + this.particleId);
    ComfortBox.app.dataSources.ParticleAPI.setShowDataRegularly(this.particleId, doShowDataRegularly, processResponse);
  };

  /**
   * Get a list of all metric names containing this box's Particle id.
   *
   * @param {Function(Error, response)} callback
   */
  ComfortBox.prototype.getMetricNames = function(callback) {
    console.log('Called function getMetricNames with particleId: ' + this.particleId);
    var that = this;
    var processResponse = function(error, response, body) {
      if (error) {
        console.log('Error received from calling KairosDB API: \n' + error);
        callback(error);
        return;
      }
      console.log(response);

      var metricsArray = [];
      for (var i = 0, len = response.length; i < len; ++i) {
        var element = response[i];
        if (element.search(that.particleId) !== -1) {
          metricsArray.push(element);
        }
      }
      callback(null, metricsArray);
    };

    console.log('Requesting KairosDB API');
    ComfortBox.app.dataSources.KairosDB.metricnames(processResponse);
  };

  /**
   * Get a list of all Comfortbox ids, which occur in KairosDB.
   *
   * @param {Function(Error, response)} callback
   */
  ComfortBox.getAllComfortboxesInDB = function(callback) {
    console.log('Called function getAllComfortboxesInDB');
    var that = this;

    var processResponse = function(error, response, body) {
      if (error) {
        console.log('Error received from calling KairosDB API: \n' + error);
        callback(error);
        return;
      }
      console.log(response);

      var comfortboxIds = [];
      for (var i = 0, len = response.length; i < len; ++i) {
        var element = response[i];
        if (element.startsWith('comfort')) {
          var comfortboxId = element.split('.')[1];
          if (comfortboxIds.indexOf(comfortboxId) === -1) {
            comfortboxIds.push(comfortboxId);
          }
        }
      }
      callback(null, comfortboxIds);
    };

    console.log('Requesting KairosDB API');
    ComfortBox.app.dataSources.KairosDB.metricnames(processResponse);
  };

  /**
   * Get a list of values from the given metric.
   *
   * @param {string} metricName The name of the metric.
   * @param {string} startRelativeValue The value for the relative start time. This value will be ignored if startAbsolute is given.
   * @param {string} startRelativeUnit The unit for the relative start time. One of: years, months, weeks, days, hours, minutes, seconds, milliseconds. This value will be ignored if startAbsolute is given.
   * @param {number} startAbsolute The start time in milliseconds since 1.1.1970 (Unix Epoch Timestamp). One of relative or absolute must be given.
   * @param {string} endRelativeValue
   * @param {string} endRelativeUnit
   * @param {number} endAbsolute
   * @param {string} aggregatorName The name of the aggregator function. One of: avg, count, dev, diff, div, first, gaps, last, least_squares, max, min, percentile, rate, sampler, save_as, scale, sum, trim
   * @param {string} aggregatorValue The value for the aggregator sampling. Mandatory if aggregatorName is given.
   * @param {string} aggregatorUnit The unit for the aggregator sampling. One of: years, months, weeks, days, hours, minutes, seconds, milliseconds. Mandatory if aggregatorName is given.
   * @param {Function(Error, response)} callback
   */
  ComfortBox.queryMetricData = function(metricName, startRelativeValue, startRelativeUnit, startAbsolute, endRelativeValue, endRelativeUnit, endAbsolute, aggregatorName, aggregatorValue, aggregatorUnit, callback) {
    console.log('Called function queryMetricData with params ' +
                'metricName: ' + metricName +
                ', startRelativeValue: ' + startRelativeValue +
                ', startRelativeUnit: ' + startRelativeUnit +
                ', startAbsolute: ' + startAbsolute +
                ', endRelativeValue: ' + endRelativeValue +
                ', endRelativeUnit: ' + endRelativeUnit +
                ', endAbsolute: ' + endAbsolute +
                ', aggregatorName: ' + aggregatorName +
                ', aggregatorValue: ' + aggregatorValue +
                ', aggregatorUnit: ' + aggregatorUnit);
    var that = this;

    if (typeof aggregatorName != 'undefined' && aggregatorName !== null) {
      if (allowedAggregators.indexOf(aggregatorName) === -1) {
        throw 'Unknown aggregator name given as input.';
      }
      if (allowedTimeUnits.indexOf(aggregatorUnit) === -1) {
        throw 'Unknown aggregator unit given as input.';
      }
      var metrics = [{name: metricName, aggregators: [{name: aggregatorName, sampling: {value: aggregatorValue, unit: aggregatorUnit}}]}];
    } else {
      var metrics = [{name: metricName}];
    }

    var startRelative = startAbsolute ? null : {value: startRelativeValue, unit: startRelativeUnit};
    if (endAbsolute || (endRelativeValue && endRelativeUnit)) {
      var endRelative = endAbsolute ? null : {value: endRelativeValue, unit: endRelativeUnit};
    }
    var cacheTime = 0;

    var processResponse = function(error, response, body) {
      if (error) {
        console.log('Error received from calling KairosDB API: \n' + error);
        callback(error);
        return;
      }
      console.log(response[0]);

      callback(null, response[0]);
    };

    console.log('Requesting KairosDB API');
    ComfortBox.app.dataSources.KairosDB.queryMetrics(metrics, startRelative, startAbsolute, endRelative, endAbsolute, cacheTime, processResponse);
  };

  /**
   * Get a list of values from the given query.
   *
   * @param {string} query The query in JSON format. See https://kairosdb.github.io/docs/build/html/restapi/QueryMetrics.html for more info.
   * @param {Function(Error, response)} callback
   */
  ComfortBox.queryMetricDataByJson = function(query, callback) {
    console.log('Called function queryMetricDataByJson with params ' +
                'query: ' + query);
    var queryJson = JSON.parse(query);

    var processResponse = function(error, response, body) {
      if (error) {
        console.log('Error received from calling KairosDB API: \n' + error);
        callback(error);
        return;
      }
      console.log(response[0]);

      callback(null, response[0]);
    };

    console.log('Requesting KairosDB API');
    ComfortBox.app.dataSources.KairosDB.queryMetricsByJson(queryJson, processResponse);
  };
};

// *****************************************************************************
// Helper functions

var processParticleResponse = function(error, response, body) {
  console.log('Processing response from Particle API.');
  console.log(response);
  if (error) {
    console.log('Error received from calling Particle API: \n' + error);
    if (error.statusCode === 401) {
      console.error('Received statusCode 401 from ParticleAPI. Did you enter your Particle token within the file \'./server/datasources.json\'?');
    }
    return error;
  }

  // TODO: parse Particle API response
  // TODO: Response is always an array containing the response object as only element.
  return response[0];
};

var convertHexToBase64 = function(hexColor) {
  if (hexColor.length % 2) {
    // Check if there is a '#' at the beginning.
    if (hexColor.startsWith('#')) {
      hexColor = hexColor.substring(1, hexColor.length);
    } else {
      console.error('The hexColor is odd and doesn\'t start with a \'#\': ' + hexColor);
      return '';
    }
  }
  var binaryArray = [];
  for (var i = 0; i < hexColor.length / 2; i++) {
    var hexPart = hexColor.substr(i * 2, 2); // Parse to binary through the HEX string
    binaryArray[i] = parseInt(hexPart, 16);
  }
  var base64Color = new Buffer(binaryArray, 'binary').toString('base64');
  console.log('Converted HEX \'' + hexColor + '\' to Base64 \'' + base64Color + '\.');
  return base64Color;
};

var multiplyBase64Color = function(base64Color, times) {
  var ledString = '';
  for (var i = 0; i < times; i++) {
    ledString += base64Color;
  }
  while (ledString.length < 96) {
    // Fill up ledString with A's (black color).
    ledString += 'A';
  }
  console.log('ledString: ' + ledString);
  return ledString;
};
