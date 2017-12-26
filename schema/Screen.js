var mongoose = require('mongoose');
var screenSchema = mongoose.Schema({
    id: {type: [String], index: true},
    roomId: String,
    type: String,
    title: String,
    viewNumber: Number,
    view: String,
    platform: String,
    live: Boolean,
    anchor: String,
    cover: String,
})

// mongoexport -d test -c students -o students.dat 
// mongoimport -d test -c students students.dat 

module.exports = mongoose.model('Screen', screenSchema);