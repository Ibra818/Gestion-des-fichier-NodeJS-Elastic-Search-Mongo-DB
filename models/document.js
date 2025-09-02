const { Schema } = require('mongoose');
const mongoose = require('../db');

const DocumentSchema = new Schema({
    doc_name: { type: String, required: true },
    contenu: String,
    insert_date: { type: Date, default: Date.now },
    update_date: { type: Date, default: Date.now },
    path: { type: String, required: true },
    format: { type: String },
    type: { type: String },
});

module.exports = mongoose.model('Document', DocumentSchema);
