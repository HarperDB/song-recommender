'use strict';

const path = require('path');
const homedir = require('os').homedir();
const fastifyStatic = require('@fastify/static');

// serves the Vue3 UI
module.exports = async (server) => {
  server.register(fastifyStatic, {
    root: path.join(__dirname, '../ui/dist'),
    prefix: '/ui',
    prefixAvoidTrailingSlash: false,
    decorateReply: false,
  });
};
