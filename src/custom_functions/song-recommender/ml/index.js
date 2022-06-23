'use strict';

const setup = require('./methods/setup');
const reset = require('./methods/reset');
const recommend = require('./methods/recommend');

class ML {
  constructor(hdbCore, logger) {
    this.hdbCore = hdbCore;
    this.logger = logger;

    this.trainingDataDirectory = '/data/clean';
    this.recommendationsTable = 'recommendations';
    this.statusTable = 'status'
    this.schema = 'hdbml_song_recommender';
    this.tables = ['users_songs', 'songs', this.recommendationsTable, this.statusTable];

    this.model = null;
  }
}

ML.prototype.setup = setup;
ML.prototype.reset = reset;
ML.prototype.recommend = recommend;

module.exports = ML;
