'use strict';

var amqp = require('amqplib/callback_api');
var amqpAutoRecovery = require('amqplib-auto-recovery');
var fs = require('fs');

module.exports = function(server, callback) {
  this.server = server;
  this.pathToKairosBindings = server.get('pathToKairosBindings');
  this.rabbitMqServer = server.get('rabbitMqServer');
  if (typeof this.rabbitMqServer == 'undefined' || this.rabbitMqServer === null || !fs.existsSync(this.pathToKairosBindings)) {
    console.warn('[MQ] RabbitMQ server config or bindings file not available. Skip messageQueue boot script.');
    callback();
    return;
  }

  console.log('[MQ] Connecting to message queue...');
  amqpAutoRecovery(amqp, {
    onError: (err) => { console.error('[MQ] An unexpected error occurred: ' + err); },
    isErrorUnrecoverable: (err) => false,
  }).connect('amqp://' + this.rabbitMqServer.username + ':' + this.rabbitMqServer.password + '@' + this.rabbitMqServer.host + ':' + this.rabbitMqServer.port, function(err, connection) {
    if (err) {
      console.error('[MQ] An unexpected error occurred: ' + err);
      return;
    }

    connection.createChannel(function(err, channel) {
      var q = 'comfort.*.online';
      channel.assertQueue(q, {durable: true});
      this.channel = channel;

      console.log('[MQ] Waiting for messages in %s. To exit press CTRL+C', q);
      channel.consume(q, handleMsg.bind(this), {noAck: false});
    }.bind(this));
  }.bind(this));
  callback();
};

function handleMsg(msg) {
  console.log('[MQ] Received msg with routingKey "%s" and message: %s', msg.fields.routingKey.toString(), msg.content.toString());
  if (msg.fields.routingKey.toString().startsWith('comfort.') && msg.fields.routingKey.toString().endsWith('.online')) {
    this.particleId = msg.fields.routingKey.toString().split('.')[1];
  } else {
    console.error('[MQ] ParticleId of ComfortBox not found in received routingKey!');
    return;
  }

  // Get ComfortBox name from Particle.
  this.server.models.ComfortBox.prototype.isOnline.bind(this)(function(err, result) {
    if (err) {
      console.error('[MQ] Failed to request isOnline: ' + err);
      return;
    }

    if (typeof result.id == 'undefined' || result.id === null) {
      console.warn('[MQ] ParticleId in received routingKey does not exist in Particle! You won\'t be able to configure this box through this API.');
      result.id = this.particleId;
    }

    if (typeof result.name == 'undefined' || result.name === null || result.name.match(/( e|E)rror/)) {
      console.warn('[MQ] ParticleId in received routingKey does not exist in Particle! Unable to get the device name.');
      result.name = 'unknown';
    }

    // Check if an instance with given id already exists, if not create a new one.
    this.server.models.ComfortBox.findOrCreate(
      {where: {particleId: result.id}},
      {name: result.name, particleId: result.id, created: new Date()},
      null,
      function(err, instance, created) {
        if (err) {
          console.error('[MQ] Failed to findOrCreate ComfortBox instance: ' + err);
          return;
        }
        if (created) {
          console.log('[MQ] A new ComfortBox instance has been created: id: ' + JSON.stringify(instance));
          updateKairosBindingsFile(this.pathToKairosBindings, this.particleId);
        } else {
          console.log('[MQ] Existing ComfortBox instance found: id: ' + JSON.stringify(instance));
        }

        this.channel.ack(msg);
      }.bind(this));
  }.bind(this));
}

function updateKairosBindingsFile(pathToKairosBindings, particleId) {
  console.log('[MQ] Update Kairos bindings.json file for particleId: ' + particleId + '. pathToKairosBindings: ' + pathToKairosBindings);

  // Read file to json
  try {
    var bindingsContent = fs.readFileSync(pathToKairosBindings, 'utf8');
  } catch (err) {
    console.error('[MQ] Failed to read file from path \'' + pathToKairosBindings + '\'. Error: ' + err);
    return false;
  }

  // Copy file to keep a backup
  try {
    fs.writeFileSync(pathToKairosBindings + '.bak', bindingsContent, {encoding: 'utf8'});
  } catch (err) {
    console.error('[MQ] An error occurred while create the backup file for \'' + pathToKairosBindings + '\'. Error: ' + err);
    return false;
  }

  // Parse content to JSON
  try {
    var bindingsJson = JSON.parse(bindingsContent);
  } catch (err) {
    console.error('[MQ] Failed to parse JSON in file from path \'' + pathToKairosBindings + '\'. Error: ' + err);
    return false;
  }

  // Add new queues and bindings
  var hasFileChanged = false;
  var queueNames = ['bat', 'co2', 'event.button.0', 'event.button.1', 'event.dtap', 'event.tap', 'hpa', 'hum', 'lux', 'offline', 'online', 'sound', 'temp', 'wind'];

  queueNames.forEach(function(element) {
    var queueToAdd = 'comfort.' + particleId + '.' + element;
    var isQueueExisting = false;
    bindingsJson.queues.forEach(function(queue) {
      if (queue.queueName.indexOf(queueToAdd) > -1) {
        console.log('[MQ] Queue \'' + queueToAdd + '\' already exist in bindings file.');
        isQueueExisting = true;
      }
    }, this);

    if (!isQueueExisting) {
      console.log('[MQ] Adding queue \'' + queueToAdd + '\' to bindings file.');
      bindingsJson.queues.push({'queueName': queueToAdd});
      bindingsJson.bindings[0].binds.push({'bindingkey': queueToAdd, 'queueName': queueToAdd});
    }
  }, this);

  // Write bindingsJson back to file (only if there were changes)
  if (hasFileChanged) {
    try {
      fs.writeFileSync(pathToKairosBindings, JSON.stringify(bindingsJson, null, 2), {encoding: 'utf8'});
    } catch (err) {
      console.error('[MQ] Failed to write new queues and bindings to file. Error: ' + err);
      return false;
    }
  }

  return true;
}
