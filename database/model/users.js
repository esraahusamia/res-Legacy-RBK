//this Model deal with users data
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var books=require('./books'); 
var userSchema = mongoose.Schema({
  username: {type: String, index: {unique: true} },
  password: String,
  // bookId:[
  //     {type: Schema.Types.ObjectId, ref: 'books'}
  //   ],
  // read:Array,
  // wantToRead:Array,
  // reading:Array,
  // favourite:Array
  favouriteList :Array,
  lists:Array
})
var users = mongoose.model('User', userSchema);
//this for encrypt password data
userSchema.pre('save', function(next) { 
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.password, null, null).bind(this)
  .then(function(hash) {
    this.password = hash;
    next();
  });
});
module.exports = users;