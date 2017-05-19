var mongoose = require('mongoose');
var userSchema = mongoose.Schema({
    nickname: String,
    avatar: String,
    password: String,
    email: String,
    setting: Object,
    authkey: String,
    steamInfo: Object,
    steamId: String,
    data: Date
})

// mongoexport -d test -c students -o students.dat 
// mongoimport -d test -c students students.dat 

module.exports = mongoose.model('User', userSchema);