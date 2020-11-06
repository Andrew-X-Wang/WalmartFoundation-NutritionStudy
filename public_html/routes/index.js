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
          checked_out : req.session.checked_out,
          tracking_budget : req.session.tracking_budget,
          tracking_time : req.session.tracking_time,
          start_time : req.session.session_start_time,
          total_time : req.session.total_time,
          remaining_time : req.session.remaining_time,
          total_budget : req.session.total_budget,
          remaining_budget : req.session.remaining_budget,
          cart_count : req.session.cart_count
        });
});

/* Login */
//CHECK IF LOGGED IN
router.get('/login', function(req, res){

    res.render('login.ejs', 
        { header     : "Welcome", 
          cart_count : 0,
          tracking_budget : null,
          tracking_time : null,
          total_budget : null,
          total_time : null,
          start_time : null,
          checked_out : null
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
          tracking_budget : req.session.tracking_budget,
          tracking_time : req.session.tracking_time,
          start_time : req.session.session_start_time,
          total_time : req.session.total_time,
          remaining_time : req.session.remaining_time,
          total_budget : req.session.total_budget,
          remaining_budget : req.session.remaining_budget,
          checked_out : req.session.checked_out,
          filter     : "default" });
});

/* Help */
router.get('/help', auth, function(req, res) {

    res.render('help.ejs', 
        { header     : "Instructions", 
          cart_count : req.session.cart_count,
          tracking_budget : req.session.tracking_budget,
          tracking_time : req.session.tracking_time,
          start_time : req.session.session_start_time,
          total_time : req.session.total_time,
          remaining_time : req.session.remaining_time,
          total_budget : req.session.total_budget,
          remaining_budget : req.session.remaining_budget,
          checked_out : req.session.checked_out,
          filter     : "default" });
});

/* Timer Update */
router.post('/update-timer', async function(req, res) {

});

module.exports = router;
