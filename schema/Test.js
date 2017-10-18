var mongoose = require('mongoose');
var testSchema = mongoose.Schema({
    count: Number,
})


module.exports = mongoose.model('Test', testSchema);