//This model to store books information
var mongoose = require('mongoose');
var bookSchema = mongoose.Schema({
  title:  String ,
  Auther: String,
  description: String,
  image:String,
  pdf:String,
  gener:String,
  rating:Number,
  publishDate:String,
  reviews:String,
  pages:Number,
  publisher:String
  // read:Boolean,
  // wantToRead:Boolean,
  // reading:Boolean,
  // favourite:Boolean
});


var books = mongoose.model('books', bookSchema);
module.exports = books;

