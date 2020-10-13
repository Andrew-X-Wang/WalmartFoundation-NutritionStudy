/* server.js 
* authors: Sammy Stolzenbach 
* last edited: July 22, 2019
*/

/* TODO: 
- Make error messages for login and registration
- Cleanse user input
- **** have to change to use async.js cuz im in callback hell right now
- fix cart.js
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

app.use('/'           , require('./routes/index'));
app.use('/user'       , require('./routes/user'));
// app.use('/repetition' , require('./routes/'));
// app.use('/is'         , require('./routes/is'));

var con = require('./routes/database.js');


/* Database connect */
/* mysql -h mysql-user -u nutritionStudy -p */
// var con = mysql.createConnection({
//     host     : 'mysql-user.eecs.tufts.edu',
//     user     : 'nutritionStudy',
//     password : 'walmart',
//     database : 'nutritionStudy'
// });

// con.connect(function(err) {
//     if (err) throw err;
//     console.log("Connected!");
// });

/*********** ROUTES -> Put in separate file eventually *************/

/************** GET routes: *************
* - Index
* - Login 
* - Registration
* - Browse-Aisles
* - Sample-Aisle
*/

/* Home/Index */
function auth (req, res, next) {

    if (req.session.loggedin) {
        res.header('Cache-Control', 
        'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        return next();
    }

    res.redirect('/login');
}

// app.get('/', auth, function(req, res) {

//     res.render('index.ejs', 
//         { header     : "Home", 
//           cart_count : req.session.cart_count });
// });

// /* Login */
// app.get('/login', function(req, res){

//     res.render('login.ejs', 
//         { header     : "Welcome", 
//           cart_count : 0 });
// });

// /* Registration */
// app.get('/registration', function(req, res){

//   res.render('registration.ejs', 
//         { header: "Create Account",
//           cart_count : 0 });
// });

// /* Browse-Aisles */
// app.get('/browse-aisles', auth, function(req, res) {

//     res.render('browse-aisles.ejs', 
//         { header     : "Browse Aisles", 
//           cart_count : req.session.cart_count });
// });

/* Sample-Aisle */


// app.get('/sample-aisle', auth, function(req, res) { 
//     //right now this selects all products because there are only 9 in the table
//     con.query('SELECT * FROM products', function(error, result) {

//         if (error) throw error;

//         res.render('sample-aisle.ejs', 
//             {header     : "Sample Aisle", 
//              items      : result,
//              cart_count : req.session.cart_count});
//     });
// });

/* Product detail page */
app.get('/products/:id', auth, function(req, res) {

    var product_id = req.params.id;

    con.query('SELECT * FROM products WHERE product_id = ?', [product_id], 
    function(error,result) {

        if (error) throw error;

        res.render('product.ejs', 
            {header     : "Product Details", 
             item       : result[0],
             cart_count : req.session.cart_count}); 
    });
});

/* Cart */
app.get('/cart', auth, function(req, res) {

  get_details = "SELECT * FROM cart_items INNER JOIN products "   +
                "ON cart_items.product_id = products.product_id " +
                "WHERE cart_id = ?";

  con.query(get_details, [req.session.cart_id], 
  function(error,result) {

    if (error) throw error;

    res.render('cart.ejs', 
        { header     : "Your Cart", 
          items      : result,
          cart_count : req.session.cart_count });
    });
});


app.get('/products/:category/:subcategory/', function(req, res) {

    var category    = req.params.category;
    var subcategory = req.params.subcategory || "all";
    var perPage     = 12;
    var filter      = req.query.filter || "price";
    var page        = req.query.page || 1;
    var offset      = (perPage * page) - perPage;

    filter = (filter == "default" ? "price" : filter);

    //MAKE CHECKS:
        // is page request reasonable?
        // is page a number?
        // make sure filter isn't dumb

    cat     = "WHERE category = ? AND subcategory = ?";
    var sub = (subcategory == "all" ? "*" : subcategory);

    count_results = 
    "SELECT COUNT(product_id) as numberOfProducts FROM products " + cat;

    con.query(count_results, [category, sub], 
    function(error, result) {
        if (error) throw error;

        var pages = Math.ceil(result[0].numberOfProducts / perPage)
        var get_products = "SELECT * FROM products " + cat + 
                           " ORDER BY " + filter + " LIMIT ? OFFSET ?";

        con.query(get_products, [category, sub, perPage, offset],
        function(error, result) {
            if (error) throw error;

            res.render('sample-aisle', 
            { header       : category + " - " + subcategory,  // change this string
              items        : result,
              filter       : filter,
              cart_count   : req.session.cart_count,
              current_page : page,
              pages        : (page <= pages ? pages : 0)
            });
        });
    });
});


/***************** POST routes: ******************
* register
* auth (login)
*/

/* Register */
// May have to completely rewrite to automate registration
// app.post('/register', function(req,res){

//     var new_user={
//         "username":req.body.username,
//         "password":req.body.password,
//         "version": 1, /* should be randomly assigned */
//         "session": 1
//     }

//     /*  ADD SECURITY CHECKS and ENCRYPTION */
//     con.query('INSERT INTO users SET ?', new_user, 
//     function (error, result, fields) {
//         if (error) throw error;  

//         req.session.user_id = result.insertId
//         var insert_new_cart = "INSERT INTO carts (user_id) VALUES ( ? )";

//         con.query(insert_new_cart, [req.session.user_id], 
//         function (error, result) {
//             if (error) throw error;

//             req.session.cart_id = result.insertId

//             var update_user_cart_id = 
//             "UPDATE users SET cart_id = ? WHERE user_id = ?"

//             info = [req.session.cart_id, req.session.user_id]

//             con.query(update_user_cart_id, info, 
//             function (error, result) {
//                 if (error) throw error;
//                 res.redirect('/login');
//             });
//         });
//     });
// });

// /* Auth / Login */
// app.post('/auth', function(request, response) {
// /* need to check if their most recent cart has been checked out, 
//  if so make a new user entry? - might have to make user_id not 
//  a primary key get rid of the auto-increment OR just update 
//  cart id and session and version id */

// /* ADD SECURITY CHECKS */
//     var username = request.body.username;
//     var password = request.body.password;
//     console.log("username:" + username);
//     console.log("password: " + password);

//     if (username && password) {

//         get_user = 
//         'SELECT * FROM users WHERE username = ? AND password = ?';

//         con.query(get_user, [username, password], 
//         function(error, results, fields) {
//             if (results.length > 0) {

//                 request.session.loggedin = true;
//                 request.session.username = username;
//                 request.session.user_id = results[0].user_id;
//                 request.session.cart_id = results[0].cart_id;

//                 get_cart_count = 
//                 "SELECT total_count FROM carts WHERE cart_id = ?";
        
//                 con.query(get_cart_count, [request.session.cart_id], 
//                 function(error, result, fields){
//                     if (error) throw error;

//                     request.session.cart_count = result[0].total_count;
//                     response.redirect('/');
//                 });

//             } else {
//                 var error = "Incorrect Username and/or Password";
//                 response.render('login.ejs', {header: "Welcome", error: error});
//             } 
//         });
//     } else {
//         var error = "Please Enter a Username and Password"
//         response.render('login.ejs',  {header: "Welcome", error: error});
//     }
// });

/* add to cart */
// to remove from db: unit_cost and sub_total
app.post('/cart-add', function(req, res) {

    var item_id = req.body.id;
    new_item = [req.session.cart_id, item_id, 1]

    upsert_product = 
    "INSERT INTO cart_items "             +
    "(cart_id, product_id, item_count) "  + 
    "VALUES (?) ON DUPLICATE KEY UPDATE " +
    "item_count = item_count + 1";

    con.query(upsert_product, [new_item], 
    function (error, result) {
        if (error) throw error;

        cart_count_plus = 
        "UPDATE carts SET total_count = total_count + 1 WHERE cart_id = ?";

        con.query(cart_count_plus, [req.session.cart_id], 
        function (error, result) {

            if (error) throw error;
            
            req.session.cart_count = req.session.cart_count + 1;
            console.log("count: "  + req.session.cart_count);
            res.send(" " + req.session.cart_count);
        });
    });
});

app.post('/cart-remove', function(req, res) {

    var item_id = req.body.id;
    var cart_id = req.session.cart_id;

    get_item_count = 
    "SELECT item_count FROM cart_items WHERE cart_id = ? AND product_id = ?"

    con.query(get_item_count, [cart_id, item_id], 
    function(error, result) {
        if (error) throw error;

        amount_deleted = result[0].item_count;
        req.session.cart_count = req.session.cart_count - amount_deleted;

        delete_product = 
        "DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?";

        con.query(delete_product, [cart_id, item_id], 
        function(error, result) {
            if (error) throw error;

            update_total_count = 
            "UPDATE carts SET total_count = ? WHERE cart_id = ?"

            con.query(update_total_count, [req.session.cart_count, cart_id],
            function(error, result) {
                if (error) throw error;

                res.send(" " + req.session.cart_count);
            });
        });
    });
});

app.post('/cart/change-count', function(req, res) {

    var item_id = req.body.id;
    var cart_id = req.session.cart_id;
    var count   = req.body.count;

    update_item_count = 
    "UPDATE cart_items SET item_count = ? WHERE cart_id = ? AND product_id = ?";

    con.query(update_item_count, [count, cart_id, item_id], 
    function(error, result) {
        if (error) throw error;

        sum_and_update = 
        "UPDATE carts SET total_count = " +
        "(SELECT SUM(item_count) FROM cart_items WHERE cart_id = ?)" +
        "WHERE cart_id = ?"

        con.query(sum_and_update, [cart_id, cart_id], 
        function(error, result) {
            if (error) throw error;

            get_count = "SELECT total_count FROM carts WHERE cart_id = ?"
            con.query(get_count, [cart_id], function(error, result) {
                if (error) throw error;

                req.session.cart_count = result[0].total_count;
                res.send("" + req.session.cart_count);

            });

        });
    });
});


// app.post('/checkout')


// For debugging ejs pages
ejsLint.lint()

// Listen on port 8000
app.listen(8000, function () {
  console.log('Listening on Port 8000');
});