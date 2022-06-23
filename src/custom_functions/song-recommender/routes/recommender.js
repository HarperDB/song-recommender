'use strict';

const ML = require('../ml');

module.exports = async (server, { hdbCore, logger }) => {

  const ml = new ML(hdbCore, logger);

  // GET /restart -
  // restarts the CF server
  server.route({
    url: '/cf-reload',
    method: 'GET',
    handler: async (request) => {
      const response = await hdbCore.requestWithoutAuthentication({
        body: {
          operation: "restart_service",
          service: "custom_functions"
        }
      });
      return response;
    }
  });

  // GET /setup -
  // this must be the first endpoint hit
  // setup the training environment (schema, tables, data)
  // RETURNS {success, message}
  server.route({
    url: '/setup',
    method: 'GET',
    handler: async (request) => {
      return ml.setup()
    }
  });

  // GET /reset -
  // this resets everything done above in /setup
  server.route({
    url: '/reset',
    method: 'GET',
    handler: async (request) => {
      return ml.reset()
    }
  });

  // GET /hello -
  // says hello
  server.route({
    url: '/hello',
    method: 'GET',
    handler: async (request) => {
      return 'hello'
    }
  });

  // GET /songs?q=
  // search for a song
  server.route({
    url: '/songs',
    method: 'GET',
    schema: {
      querystring: {
        name: { type: 'string' }
      }
    },
    handler: async (request) => {
      const query = '*' + request.query.q.toLowerCase() + '*'
      const count = await hdbCore.requestWithoutAuthentication({
        body: {
          operation: 'search_by_value',
          schema: 'hdbml_song_recommender',
          table: 'songs',
          search_attribute: 'search',
          search_value: query,
          get_attributes: ['*']
        }
      })
      return count
    }
  });

  // get recommendations
  server.route({
    method: 'POST',
    url: '/recommend',
    handler: async (request) => {
      const { songIdxs } = request.body;
      const response = await ml.recommend(songIdxs);
      return response;
    }
  });

};
