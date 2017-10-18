var mongoose = require('mongoose');
var screenSchema = mongoose.Schema({
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

screenSchema.methods.updateByScreen = function(screen, callback) {
    this.model('Screen').update({platform: screen.platform, roomId: screen.roomId}, {$set: screen}, {upsert: true}, (err, doc) => {
        if(err) callback && callback(null, err)
        callback && callback(null, doc)
    })
}

// mongoexport -d test -c students -o students.dat 
// mongoimport -d test -c students students.dat 

module.exports = mongoose.model('Screen', screenSchema);