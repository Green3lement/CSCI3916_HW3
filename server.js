var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors= require('cors');
var User = require('./Users');
var Movie = require('./Movies');
var app = express();
module.exports = app;
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObject(req, message, status) {
    var json = {
        message: message,
        status: status,
        headers : "No Headers",
        key: process.env.SECRET_KEY,
        body : "No Body"
    };

    if (req.body != null) {
        json.body = req.body;
    }
    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.route('/postjwt')
    .post(authJwtController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
        }
    );

router.route('/users/:userId')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.userId;
        User.findById(id, function(err, user) {
            if (err) res.send(err);

            var userJson = JSON.stringify(user);
            // return that user
            res.json(user);
        });
    });

router.route('/users')
    .get(authJwtController.isAuthenticated, function (req, res) {
        User.find(function (err, users) {
            if (err) res.send(err);
            // return the users
            res.json(users);
        });
    });

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, message: 'Please pass username and password.'});
    }
    else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;
        // save the user
        user.save(function(err) {
            if (err) {
                // duplicate entry
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists. '});
                else
                    return res.send(err);
            }

            res.json({ success: true, message: 'User created!' });
        });
    }
});

router.post('/signin', function(req, res) {
    var userNew = new User();
    //userNew.name = req.body.name;
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) res.send(err);

        user.comparePassword(userNew.password, function(isMatch){
            if (isMatch) {
                var userToken = {id: user._id, username: user.username};
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, message: 'Authentication failed.'});
            }
        });


    });
});



router.route('/Movies')
    .get(authJwtController.isAuthenticated, function (req, res) {
        Movie.find(function (err, movies) {
            if (err) res.send(err);

            res.json(movies);
        });
    });

router.route('/Movies')
    .post(authJwtController.isAuthenticated, function (req, res) {
           var movie = new Movies({
               title : req.body.title,
               year : req.body.year,
               genre : req.body.genre,
               actor1: req.body.actor1,
               actor1role: req.body.actor1role,
               actor2: req.body.actor2,
               actor2role: req.body.actor2role,
               actor3: req.body.actor3,
               actor3role: req.body.actor3role
            });
           
           movie.save(function(err){
               if(err){
                   if(err.code == 11000)
                       return res.json({success:false, message:'Duplicate entry'});
                   else
                       return res.send(err);
               }
               res.json({message: 'Movie added!!!!'});
           });
    });

router.route('/Movies')
    .put(authJwtController.isAuthenticated, function (req, res) {

        Movie.findById(req.body.movie_id, function (err, movie) {
            if (err)
                res.send(err);
            if (req.body.title) movie.Title = req.body.title;
            if (req.body.year) movie.year = req.body.year;
            if (req.body.genre) movie.genre = req.body.genre;
            if (req.body.actor1) movie.FirstActor = req.body.actor1;
            if (req.body.actor1role) movie.FirstActorChar = req.body.actor1role;
            if (req.body.actor2) movie.SecondActor = req.body.actor2;
            if (req.body.actor2role) movie.SecondActorChar = req.body.actor2role;
            if (req.body.actor3) movie.ThirdActor = req.body.actor3;
            if (req.body.actor3role) movie.ThirdActorChar = req.body.actor3role;

            movie.save(function (err) {
                if (err) res.send(err);

                res.json({message: 'Movie Updated !'});
            });
        });
    });

router.route('/Movies')
    .delete(authJwtController.isAuthenticated, function (req, res) {
        Movie.remove({
            _id:req.body.movie_id
        }, function(err, movies){
            if (err) return res.send(err);
                res.json({message: "Deleted the Movie!"});
        });
    });

app.use('/', router);
app.listen(process.env.PORT || 8080);

module.exports = app; // for testing