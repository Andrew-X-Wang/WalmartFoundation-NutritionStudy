var express  = require('express');
var router   = express.Router();
var con      = require('./database.js'); //in routes file already


/* Register */
// May have to completely rewrite to automate registration
// router.post('/register', async function(req,res){

//     var new_user={
//         "username":req.body.username,
//         "password":req.body.password,
//         "version": 1, /* should be randomly assigned */
//         "session": 1
//     }

//     var insert_new_user     = 'INSERT INTO users SET ?'
//     var insert_new_cart     = "INSERT INTO carts (user_id) VALUES ( ? )";
//     var update_user_cart_id = "UPDATE users SET cart_id = ? WHERE user_id = ?"

//     try {

//         var added_user      = await con.query(insert_new_user, new_user);
//         req.session.user_id = added_user.insertId;

//         var added_cart         = await con.query(insert_new_cart, [req.session.user_id]);
//         req.session.cart_count = added_cart.insertId;

//         var user_and_cart  = [req.session.cart_id, req.session.user_id]
//         var bind_user_cart = await con.query(update_user_cart_id, user_and_cart);

//         res.redirect('/login');

//     } catch(err){console.log(err); res.send(err)}
// });

/* Auth / Login */
router.post('/auth', async function(req, res) {
/* need to check if their most recent cart has been checked out, 
 if so make a new user entry? - might have to make user_id not 
 a primary key get rid of the auto-increment OR just update 
 cart id and session and version id */

/* ADD SECURITY CHECKS */
    var username = req.body.username;
    var password = req.body.password;

    var get_user = "SELECT * FROM users WHERE username = ? AND password = ?";
    var get_cart = "SELECT * FROM carts WHERE cart_id = ?";

    var date = new Date();

    if (username && password) {
        try {
            var login_results = await con.query(get_user, [username, password]);

            if (login_results.length > 0) {
                req.session.loggedin = true;
                req.session.username = username;
                req.session.user_id  = login_results[0].user_id;
                req.session.cart_id  = login_results[0].cart_id;
                req.session.total_budget = login_results[0].total_budget;
                req.session.tracked_resource = login_results[0].tracked_resource;
                req.session.session_start_time = date.getTime();

                var cart_info =  await con.query(get_cart, [req.session.cart_id]);  
                req.session.cart_count = cart_info[0].total_count;
                req.session.remaining_budget = cart_info[0].remaining_budget;
                req.session.total_time = cart_info[0].remaining_time;  // Remaining time at the start of the session. Should default to .total_time
                req.session.remaining_time = cart_info[0].remaining_time;

                res.redirect('/');    
            } else {
                var error = "Incorrect Username and/or Password";
                res.render('login.ejs', {header: "Welcome", error: error, cart_count: 0, tracked_resource: null, total_budget: null, total_time: null});  
            }
        } catch(err) {console.log(err); res.send(err)}

    } else {
        var error = "Incorrect Username and/or Password";
        res.render('login.ejs', {header: "Welcome", error: error, cart_count: 0, tracked_resource: null, total_budget: null, total_time: null});        
    }
});

module.exports = router;