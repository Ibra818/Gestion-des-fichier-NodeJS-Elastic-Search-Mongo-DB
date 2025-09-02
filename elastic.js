const {Client} = require('@elastic/elasticsearch') 
const { model } = require('mongoose')

const esClient = new Client({node: 'http://localhost:9200'})

module.exports = esClient;