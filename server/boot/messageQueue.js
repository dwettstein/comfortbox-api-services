'use strict';

var amqp = require('amqplib/callback_api');
var fs = require('fs');

module.exports = function(server, callback) {
  if (typeof server.locals.settings.rabbitMqServer == 'undefined' || server.locals.settings.rabbitMqServer === null) {
    console.warn('RabbitMQ server config not available. Skip messageQueue boot script.');
    callback();
    return;
  }

  this.host = server.locals.settings.rabbitMqServer.host;
  this.port = server.locals.settings.rabbitMqServer.port;
  this.username = server.locals.settings.rabbitMqServer.username;
  this.password = server.locals.settings.rabbitMqServer.password;
  this.server = server;

  console.log('Connecting to message queue...');
  amqp.connect('amqp://' + this.username + ':' + this.password + '@' + this.host + ':' + this.port, function(err, connection) {
    if (err) {
      console.error(err);
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
      console.error(err);
      return;
    }

    if (typeof result.id == 'undefined' || result.id === null) {
      console.warn('[MQ] ParticleId in received routingKey does not exist in Particle! You won\'t be able to configure this box through this API.');
      result.id = this.particleId;
    }

    if (typeof result.name == 'undefined' || result.name === null) {
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
          console.error(err);
          return;
        }
        if (created) {
          console.log('[MQ] A new ComfortBox instance has been created: id: ' + JSON.stringify(instance));
          updateKairosBindingsFile(this.server.locals.settings.pathToKairosBindings, this.particleId);
        } else {
          console.log('[MQ] Existing ComfortBox instance found: id: ' + JSON.stringify(instance));
        }

        this.channel.ack(msg);
      }.bind(this));
  }.bind(this));
}

function updateKairosBindingsFile(pathToKairosBindings, particleId) {
  console.log('Update Kairos bindings.json file for particleId: ' + particleId + '. pathToKairosBindings: ' + pathToKairosBindings);
  // Read file to json
  try {
    var bindingsContent = fs.readFileSync(pathToKairosBindings, 'utf8');
  } catch (error) {
    console.error('Failed to read file from path \'' + pathToKairosBindings + '\'. Error: ' + error);
    return false;
  }
  try {
    var bindingsJson = JSON.parse(bindingsContent);
  } catch (error) {
    console.error('Failed to parse JSON in file from path \'' + pathToKairosBindings + '\'. Error: ' + error);
  }

  console.log(bindingsJson.bindings[0].binds);
  console.log(bindingsJson.queues);

  return true;
}
