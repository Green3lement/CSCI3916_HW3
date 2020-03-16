var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.Promis = global.Promise;
mongoose.connect(process.env.DB,{ useNewUrlParser:true });
mongoose.set('useCreateIndex', true);
//movies schema
var MoviesSchema = new Schema({
    title: String,
    year: Number,
    genre: String,
    actor1: String,
    actor1role: String,
    actor2: String,
    actor2role: String,
    actor3: String,
    actor3role: String
});

module.exports = mongoose.model('Movie', MovieSchema);