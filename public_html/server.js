/* server.js 
* authors: Sammy Stolzenbach 
* last edited: July 22, 2019
*/

/* TODO: 
- Make error messages for login and registration
- Cleanse user input
- fix cart.js frontend variables
-
*/
/* app dependencies */
var express    = require('express');
var app        = express();
var path       = require("path");
var mysql      = require('mysql');
const ejsLint  = require('ejs-lint');
var session    = require('express-session');
var bodyParser = require('body-parser');


/* set view enjine for ejs files */
app.set('port', (process.env.PORT || 8000));
app.set('views', './views');
app.set('view engine', 'ejs');

/* use parser for requests and 
 set static views to public folder */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

/* sessions for login */
app.use(session({
    secret: 'secret', /* make this a better secret */
    resave: true,
    saveUninitialized: true
}));


/*********** ROUTES *************/
app.use('/'              , require('./routes/index'));
app.use('/user'          , require('./routes/user'));
app.use('/cart'          , require('./routes/cart'));
app.use('/products'      , require('./routes/products'));
app.use('/past-purchases', require('./routes/past-purchases'));

// turn this into an app.use
function auth (req, res, next) {

    if (req.session.loggedin) {
        res.header('Cache-Control', 
        'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        return next();
    }

    res.redirect('/login');
}


// For debugging ejs pages
ejsLint.lint()

// Listen on port 8000
app.listen(8000, function () {
  console.log('Listening on Port 8000');
});
