'use strict';

global.expect = require('chai').expect;
global.app = require('../server/server.js');
global.request = require('supertest')(app);
