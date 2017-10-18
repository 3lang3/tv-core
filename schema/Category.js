var mongoose = require('mongoose');
var categorySchema = mongoose.Schema({
    name: String,
    description: String,
    result: Object,
})

// mongoexport -d test -c students -o students.dat 
// mongoimport -d test -c students students.dat 

module.exports = mongoose.model('Category', categorySchema);