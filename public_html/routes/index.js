var express  = require('express');
var router   = express.Router();
var con      = require('./database.js');

/************** GET routes: *************
* - Index
* - Login 
* - Registration
* - Browse-Aisles
* - Sample-Aisle
*/

function auth (req, res, next) {

    if (req.session.loggedin) {
        res.header('Cache-Control', 
        'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        return next();
    }

    res.redirect('/login');
}

router.get('/', auth, function(req, res) {

    res.render('index.ejs', 
        { header     : "Home", 
          cart_count : req.session.cart_count,
          tracked_resource : req.session.tracked_resource,
          remaining_budget : req.session.remaining_budget
        });
});

/* Login */
//CHECK IF LOGGED IN
router.get('/login', function(req, res){

    res.render('login.ejs', 
        { header     : "Welcome", 
          cart_count : 0,
          tracked_resource : null,
          total_resource : null
        });
});

/* Registration */
// router.get('/registration', function(req, res){

//   res.render('registration.ejs', 
//         { header: "Create Account",
//           cart_count : 0 });
// });

/* Browse-Aisles */
router.get('/browse-aisles', auth, function(req, res) {

    res.render('browse-aisles.ejs', 
        { header     : "Browse Aisles", 
          cart_count : req.session.cart_count,
          tracked_resource : req.session.tracked_resource,
          remaining_budget : req.session.remaining_budget,
          filter     : "default" });
});

/* Help */
router.get('/help', auth, function(req, res) {

    res.render('help.ejs', 
        { header     : "Instructions", 
          cart_count : req.session.cart_count,
          tracked_resource : req.session.tracked_resource,
          remaining_budget : req.session.remaining_budget,
          filter     : "default" });
});


module.exports = router;
