'use strict';

const path = require('path');
const axios = require('axios');

/**
  setup
  creates the schema
  loads the song data
 */

async function setup (update) {
  try {
    const results = await this.hdbCore.requestWithoutAuthentication({
      body: {
        operation: 'search_by_hash',
        schema: 'hdbml_song_recommender',
        table: this.statusTable,
        hash_values: ['primary'],
        get_attributes: ['*']
      }
    })
    if (results[0].setup) {
      const message = 'HDBML Environment is Ready';
      this.logger.notify(message);
      return { success: true, message};
    } else {
      const message = 'HDBML Environment Setup in Progress. Check the logs for more info. The process should be complete within 5 minutes.';
      this.logger.notify(message);
      return { success: true, message};
    }
  } catch (error) {
    console.log('error', error)
    await createSchema.apply(this);
  }


  await this.hdbCore.requestWithoutAuthentication({
    body: {
      operation: 'upsert',
      schema: this.schema,
      table: this.statusTable,
      records: [
        {
          id: 'primary',
          setup: false
        }
      ]
    }
  })
  insertData.apply(this).then(() => {
    this.hdbCore.requestWithoutAuthentication({
      body: {
        operation: 'upsert',
        schema: this.schema,
        table: this.statusTable,
        records: [
          {
            id: 'primary',
            setup: true
          }
        ]
      }
    })
  })
  const message = 'HDBML Environment Setup in Progress. Check the logs for more info. The process should be complete within 5 minutes.';
  this.logger.notify(message);
  return { success: true, message};
}

async function createSchema() {
  let already = 'already ';
  this.logger.notify(`Checking for ML schema ${this.schema}.`)
  try {
    await this.hdbCore.requestWithoutAuthentication({
      body: {
        operation: 'describe_schema',
        schema: this.schema
      }
    });
  } catch (error) {
    already = '';
    this.logger.notify(`ML schema does not exist. Creating ${this.schema} schema.`)
    await this.hdbCore.requestWithoutAuthentication({
      body: {
        operation: 'create_schema',
        schema: this.schema
      }
    });
  }
  this.logger.notify(`ML schema ${this.schema} ${already}created.`)

  for (let table of this.tables) {
    already = 'already ';
    this.logger.notify(`Checking for ML table ${this.schema}.${table}.`)
    try {
      await this.hdbCore.requestWithoutAuthentication({
        body: {
          operation: 'describe_table',
          schema: this.schema,
          table
        }
      });
    } catch (error) {
      already = '';
      this.logger.notify(`ML table does not exist. Creating ${this.schema}.${table}.`)
      await this.hdbCore.requestWithoutAuthentication({
        body: {
          operation: 'create_table',
          schema: this.schema,
          table,
          hash_attribute: 'id'
        }
      });
    }
    this.logger.notify(`ML table ${this.schema}.${table} ${already}created.`)
  }
}

async function insertData() {
  const objects = ['songs', 'users_songs'];
  for (const objectName of objects) {
    const table = objectName.toLowerCase()  
    this.logger.notify(`Checking ${this.schema}.${table} for data.`)
    let already = 'already ';
    const count = await this.hdbCore.requestWithoutAuthentication({
      body: {
        operation: 'sql',
        sql: `SELECT COUNT(*) FROM ${this.schema}.${table}`
      }
    })
    if (!count[0]['COUNT(*)']) {
      already = ''
      this.logger.notify(`Adding ${this.schema}.${table} data.`)
      const { data } = await axios({
        method: 'post',
        url: 'http://localhost:9935',
        headers: {
          "authorization": "Basic " + Buffer.from('hdbml:hdbml').toString('base64'),
        },
        data: {
          operation: 'csv_file_load',
          schema: this.schema,
          table,
          file_path: path.join(this.trainingDataDirectory, `${objectName}.csv`)
        }        
      })

      const jobId = data.message.split(' ').pop()
      // console.log('jobId', jobId)
      for (let i = 0; i < 1000; i++) {
        const response = await this.hdbCore.requestWithoutAuthentication({
          body: {
            operation: 'get_job',
            id: jobId
          }
        })
        // console.log('response', response)
        if (response[0].status === 'COMPLETE') break;
        await new Promise(r => setTimeout(r, 10000))
      }
    }
    this.logger.notify(`${this.schema}.${table} ${already}populated.`)
  }
}

module.exports = setup
