'use strict';

/**
  reset
  drops the hdbml schema
 */
async function reset () {
  await dropSchema.apply(this);

  const message = 'ML setup has been reset';
  this.logger.notify(message);
  return { success: true, message};
}

async function dropSchema() {
  let already = '';
  this.logger.notify(`Checking for ML schema ${this.schema}.`)
  try {
    await this.hdbCore.requestWithoutAuthentication({
      body: {
        operation: 'drop_schema',
        schema: this.schema
      }
    });
  } catch (error) {
    already = 'alread ';
  }
  this.logger.notify(`ML schema ${this.schema} has ${already}been dropped.`)
}

module.exports = reset
