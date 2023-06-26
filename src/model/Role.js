const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Role = new Schema({
    author: ObjectId,
    title: String,
    body: String,
    date: Date
});


module.exports = Role;  