//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const util = require('util');
const consoleStamp = require('console-stamp');
const mongoose = require('mongoose');

// I like logging with this tool
consoleStamp(console, {
  pattern: 'HH:MM:ss.l',
  colors: {
    stamp: 'yellow',
    label: 'blue'
  }
});

// MongoDB connection
mongoose.connect('mongodb://localhost/BlogDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

// MongoDB structure
const postSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true,"Post title can't be empty."] },
  content: String,
  date: Date
});
const Post = mongoose.model('Post', postSchema);

// Blog's main content is "lorem ipsom"
const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";


// Date to String format
const dateToStringOptions = {
  day: 'numeric',
  month:'long',
  year: 'numeric'
};
// This helps setting default values for input[type="date"] elements
Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});

// port number for Heroku, 3000 on localhost
const port = process.env.PORT || 3000;

const app = express();
// Using ejs
app.set('view engine', 'ejs');
// Using body_parser
app.use(bodyParser.urlencoded({extended: true}));
// Using public folder
app.use(express.static("public"));

// Home page
app.get('/',function(req,res){
  let postPreviews = [];
  // Find all posts
  Post.find({},(err,posts)=>{
    if (err) {
      res.render('error',{ err:err });
      console.error(err);
    } else {
      // sort posts by date
      posts.sort((a,b)=>{
        if (a.date<b.date)
          return -1;
        return 1;
      });
      // truncate long posts. We only need previews
      posts.forEach((post) => {
        const truncateOptions ={
          length: 100,
          omission: ' ...'
        }
        postPreviews.push({
          _id: post._id,
          title: post.title,
          content: _.truncate(post.content,truncateOptions),
          date: post.date.toLocaleDateString('en-GB', dateToStringOptions)
        });
      })
      res.render('home',{homeStartingContent:homeStartingContent,posts:postPreviews});
    }
  });
});

// About page. Just "Lorem ipsom"
app.get('/about',function(req,res){
  res.render('about',{aboutContent:aboutContent});
});
// Contact page. Just "Lorem ipsom"
app.get('/contact',function(req,res){
  res.render('contact',{contactContent:contactContent});
});

// show individual posts, based on their IDs
app.get('/posts/:ID',(req,res) => {
  const requestedPost = req.params.ID;
  // Check if the parameter is a valid ID, to avoid getting error messages
  if (mongoose.Types.ObjectId.isValid(req.params.ID)){
    Post.findById(requestedPost,(err,post)=>{
      if (err) {
        res.render('error',{ err:err });
        console.error(err);
      } else {
        if (post) {
          // We found the post
          const postMod = {
            _id: post._id,
            title: post.title,
            content: post.content,
            date: post.date.toLocaleDateString('en-GB', dateToStringOptions)
          }
          res.render('post',{post:postMod});
        } else {
          // We didn't find the post
          res.render('404');
        }
      }
    });
  } else {
    // Parameter is not a valid ID
    res.render('404');
  }
});

// Hidden Maintenance page
app.get('/maintenance',function(req,res){
  let postPreviews = [];
  // Find all posts
  Post.find({},(err,posts)=>{
    if (err) {
      res.render('error',{ err:err });
      console.error(err);
    } else {
      // Sort posts by date
      posts.sort((a,b)=>{
        if (a.date<b.date)
          return -1;
        return 1;
      });
      // Truncate long posts
      posts.forEach((post) => {
        const truncateOptions ={
          length: 100,
          omission: ' ...'
        }
        postPreviews.push({
          _id: post._id,
          title: post.title,
          content: _.truncate(post.content,truncateOptions),
          date: post.date.toLocaleDateString('en-GB', dateToStringOptions)
        });
      })
      res.render('maintenance',{homeStartingContent:homeStartingContent,posts:postPreviews});
    }
  });
});

// Compose new posts
app.get('/compose',function(req,res){
  // Check limit first. We don't want too much content in this demo project
  checkPostLimit(res,(count)=>{
    res.render('compose',{
      pageTitle: 'Compose',
      formAction: '/compose',
      dateInputValue: new Date().toDateInputValue(),
      titleInputValue: "",
      contentInputValue: "",
      buttonValue: ""
    });
  });
});

// Check limit. We don't want too much content in this demo project
function checkPostLimit(res,callback){
  const limit = 10;
  Post.countDocuments({},(err,count)=>{
    if (err) {
      res.render('error',{ err:err });
      console.error(err);
    } else {
      if (count < limit) {
        // If we can have more posts
        callback(count);
      } else {
        // If we reached the limit
        res.render('limit');
      }
    }
  });
}

// Save new post to database
app.post('/compose',function(req,res){
  // Check limit first. We don't want too much content in this demo project
  checkPostLimit(res,(count)=>{
    // Create new post
    let post =  new Post({
      title: req.body.postTitle.substring(0,50),
      content: req.body.postContent.substring(0,500),
      date: new Date(req.body.postDate)
    });
    post.save((err)=>{
      if (err) {
        res.render('error',{ err:err });
        console.error(err);
      } else {
        res.redirect("/maintenance");
      }
    });
  });
});

// Edit existing post - Open the editor
app.post('/edit',function(req,res){
  // The _id of the post is the button's value
  let requestedPost = req.body.button;
  Post.findOne({_id:requestedPost},(err,post)=>{
    if (err) {
      res.render('error',{ err:err });
      console.error(err);
    } else {
      if (post) {
        // If we found the post
        res.render('compose',{
          pageTitle: 'Edit',
          formAction: '/editSave',
          dateInputValue: post.date.toDateInputValue(),
          titleInputValue: post.title,
          contentInputValue: post.content,
          buttonValue: post._id
        });
      } else {
        // If we didn't find the post
        res.render('404');
      }
    }
  });
});

// Edit existing post - Save the post
app.post('/editSave',function(req,res){
  // The _id of the post is the button's value
  let requestedPost = req.body.button;
  Post.findOne({_id:requestedPost},(err,post)=>{
    if (err) {
      res.render('error',{ err:err });
      console.error(err);
    } else {
      if (post) {
        // If we found the post
        post.title = req.body.postTitle.substring(0,50);
        post.content = req.body.postContent.substring(0,500);
        post.date = new Date(req.body.postDate);
        post.save((err)=>{
          if (err) {
            res.render('error',{ err:err });
            console.error(err);
          } else {
            res.redirect("/maintenance");
          }
        });
      } else {
        // If we didn't find the post
        res.render('404');
      }
    }
  });
});


app.post('/delete',function(req,res){
  // The _id of the post is the button's value
  let requestedPost = req.body.button;
  Post.deleteOne({_id:requestedPost},(err)=>{
    if (err) {
      res.render('error',{ err:err });
      console.error(err);
    } else {
      res.redirect("/maintenance");
    }
  });
});

app.listen(port, () => {
  log('You can access the blog on http://localhost:' + port);
  log('To create, edit, or delete posts, open http://localhost:' + port + '/maintenance');

});

/**
 * log - colorfull console.log() for "description: object" style logging
 *
 * @param  {string} msg description of the object
 * @param  {any}    obj will be logged using util.inspect()
 * @return {undefined}
 */
function log(msg, obj) {
  if (typeof obj === 'undefined') {
    if (typeof msg === 	'string'){
      return console.log('\x1b[36m' + msg + '\x1b[0m');
    }
    return console.log(msg);
  }
  return console.log('\x1b[36m' + msg + '\x1b[0m' +
    util.inspect(obj, {
      colors: true
    }));
}
