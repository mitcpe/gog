var gulp = require('gulp'),
    concat = require('gulp-concat'),
    request = require('request'),
    fs = require('fs'),
    config = require('dotenv').config();

var buildSrc = "./";
var buildDest = "public";

gulp.task("get-comments", function (done) {

  // set up our request with appropriate auth token and Form ID
  var url = `https://api.netlify.com/api/v1/forms/${process.env.COMMENT_FORM_ID}/submissions/?access_token=${process.env.API_AUTH}`;

  // Go and get the data from Netlify's submissions API
  request(url, function(err, response, body){
    if(!err && response.statusCode === 200){
      console.log("Submissions found");
      var body = JSON.parse(body);
      var comments = {};

      // massage the data into the shape we want,
      // and add a gravatar URL if possible
      for(var item in body){
        var data = body[item].data;

        var comment = {
          name: data.Name,
          // avatar: gravatar.url(data.email, {s: '100', r: 'x', d: 'retro'}, true),
          comment: data.Comment,
          date: body[item].created_at
        };

        // Add it to an existing array or create a new one
        if(comments[data.path]){
          comments[data.path].push(comment);
        } else {
          comments[data.path] = [comment];
        }
      }

      // write our data to a file where our site generator can get it.
      fs.writeFile(buildSrc + "data/comments.json", JSON.stringify(comments, null, 2), function(err) {
        if(err) {
          console.log(err);
          done();
        } else {
          console.log("Comments data saved.");
          done();
        }
      });

    } else {
      console.log("Couldn't get comments from Netlify");
      done();
    }
  });
});

gulp.task('dev', gulp.series('get-comments'));

gulp.task('build', gulp.series('get-comments'));