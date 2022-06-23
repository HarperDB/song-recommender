'use strict';

const path = require('path');
const tf = require('@tensorflow/tfjs-node');

async function recommend(songIdxs) {
  if (!this.model) {
    const modelPath = path.join(__dirname, '../', 'tfjs-model', 'model.json');
    this.model = await tf.loadGraphModel(`file://${modelPath}`);
  }

  const inputTensor = tf.tensor([songIdxs], [1, 3], 'int32')
  const results = this.model.execute(inputTensor)
  const r0 = await results[0].data()
  // the first elemnt is not always the recommended index, so we check
  const recommendationsArray = r0.constructor === Int32Array ? r0 : await results[1].data()
  const recommendedUserIdx = recommendationsArray[0]
  console.log('recommendedUserIdx', recommendedUserIdx)
  const recommendedSongIdxs = await this.hdbCore.requestWithoutAuthentication({
    body: {
      operation: 'search_by_value',
      schema: 'hdbml_song_recommender',
      table: 'users_songs',
      search_attribute: 'user_idx',
      search_value: recommendedUserIdx,
      get_attributes: ['song_idx', 'play_count']
    }
  })

  const songInputRetrievalPromises = songIdxs.map(async songIdx => {
    const results = await this.hdbCore.requestWithoutAuthentication({
      body: {
        operation: 'search_by_value',
        schema: 'hdbml_song_recommender',
        table: 'songs',
        search_attribute: 'index',
        search_value: songIdx,
        get_attributes: ['song', 'artist']
      }
    })
    return results[0]
  })
  const inputSongs = await Promise.all(songInputRetrievalPromises)

  const songRetrievalPromises = recommendedSongIdxs
    .filter(songIdxObj => !songIdxs.includes(songIdxObj.song_idx))
    .map(async songIdxObj => {
    const results = await this.hdbCore.requestWithoutAuthentication({
      body: {
        operation: 'search_by_value',
        schema: 'hdbml_song_recommender',
        table: 'songs',
        search_attribute: 'index',
        search_value: songIdxObj.song_idx,
        get_attributes: ['*']
      }
    })
    return Object.assign(songIdxObj, results[0]);
  })
  const recommendedSongs = await Promise.all(songRetrievalPromises)

  await this.hdbCore.requestWithoutAuthentication({
    body: {
      operation: 'insert',
      schema: this.schema,
      table: this.recommendationsTable,
      records: [
        {
          songIdxsIn: songIdxs,
          songsIn: inputSongs,
          songIdxsOut: recommendedSongs.map(s => s.song_idx),
          songsOut: recommendedSongs.map(s => Object.assign({}, {song: s.song}, {artist: s.artist}))
        }
      ]
    }
  });   

  return recommendedSongs
}

module.exports = recommend
