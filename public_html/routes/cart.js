var express  = require('express');
var router   = express.Router();
var con      = require('./database.js'); //in routes file already

var taxRate = 0.05;
var shippingRate = 9.00; 
var LEADER_SIZE = 100;

/* How to put this in a separate file :( need to be used in both producs.js and here*/
async function get_leaderboard () {
    var get_leaderboard = "SELECT users.username, users.user_id, carts.health_total " + 
                          "FROM users INNER JOIN carts " + 
                          "ON users.cart_id=carts.cart_id order by health_total desc " + 
                          "LIMIT ?;"
    try {
        var leaderboard = await con.query(get_leaderboard, [LEADER_SIZE]);
    } catch (err) {
        console.log(err);
    }
    return leaderboard;
}

async function calc_cart_totals(cart_id) {
    var get_item_info = "SELECT cart_items.item_count, products.price " + 
                        "FROM cart_items join products " + 
                        "ON cart_items.product_id = products.product_id " +
                        "WHERE cart_items.cart_id = ?;";
    var totals = {
        "subtotal": 0,
        "tax": 0,
        "total": 0
    }

    try {
        var subtotal = 0;
        var item_count;
        var unit_price;
        var cart_item_info = await con.query(get_item_info, [cart_id]);
        for (var i = 0; i < cart_item_info.length; i ++) {
            item_count = cart_item_info[i]['item_count'];
            unit_price = cart_item_info[i]['price'];
            subtotal += item_count * unit_price;
        }

        /* Calculate totals */
        totals['subtotal'] = subtotal;
        totals['tax'] = subtotal * taxRate;
        totals['total'] = subtotal + totals['tax'];
    } catch(err) {console.log("Error calculating cart totals");}

    return totals;
}


/* Cart */
function auth (req, res, next) {

    if (req.session.loggedin) {
        res.header('Cache-Control', 
        'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        return next();
    }

    res.redirect('/login');
}

router.get('/', auth, async function(req, res) {

  var get_details = "SELECT * FROM cart_items INNER JOIN products "   +
                    "ON cart_items.product_id = products.product_id " +
                    "WHERE cart_id = ?";
  var user_id = req.session.user_id;
  try {
    var cart = await con.query(get_details, [req.session.cart_id]);
    var leaderboard = await get_leaderboard();

    res.render('cart.ejs', { 
        header      : "Your Cart", 
        items       : cart,
        cart_count  : req.session.cart_count,
        tracking_budget : req.session.tracking_budget,
        tracking_time : req.session.tracking_time,
        start_time : req.session.session_start_time,
        total_time : req.session.total_time,
        remaining_time : req.session.remaining_time,
        total_budget : req.session.total_budget,
        remaining_budget : req.session.remaining_budget,
        leaderboard : leaderboard,
        user_id     : user_id
    });

  } catch(err) { console.log(err); res.send("error"); }
});


router.post('/add', async function(req, res) {
    var item_id  = req.body.id;
    var cart_id  = req.session.cart_id;
    var new_item = [cart_id, item_id, 1]

    var upsert_product  = "INSERT INTO cart_items (cart_id, product_id, item_count) " + 
                          "VALUES (?) ON DUPLICATE KEY UPDATE item_count = item_count + 1";
    var cart_count_plus = "UPDATE carts SET total_count = total_count + 1 WHERE cart_id = ?";

    try {
        var upsert_result = await con.query(upsert_product, [new_item]); //insert
        var cart_plus_one = await con.query(cart_count_plus, [cart_id]); //update cart count/*

        req.session.cart_count = req.session.cart_count + 1;
        res.send(" " + req.session.cart_count);

    } catch (err) {console.log(err); res.send("error")}
});


router.post('/remove', async function(req, res) {
    var item_id = req.body.id;
    var cart_id = req.session.cart_id;

    var get_item_count     = "SELECT item_count FROM cart_items WHERE cart_id = ? AND product_id = ?"
    var delete_product     = "DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?";
    var update_total_count = "UPDATE carts SET total_count = ? WHERE cart_id = ?"

    try {
        var item_count_result = await con.query(get_item_count, [cart_id, item_id]);
        var amount_deleted    = item_count_result[0].item_count;
        
        req.session.cart_count = req.session.cart_count - amount_deleted;
        
        var remove_product = await con.query(delete_product, [cart_id, item_id]);
        var update_count   = await con.query(update_total_count, [req.session.cart_count, cart_id]);

        res.send(" " + req.session.cart_count);

    } catch (err) { res.send(err) }
});


router.post('/change-count', async function(req, res) {
    var item_id = req.body.id;
    var cart_id = req.session.cart_id;
    var count   = req.body.count;

    var update_item_count = "UPDATE cart_items SET item_count = ? WHERE cart_id = ? AND product_id = ?";
    var sum_and_update    = "UPDATE carts SET total_count = " +
                            "(SELECT SUM(item_count) FROM cart_items WHERE cart_id = ?) WHERE cart_id = ?";
    var get_count         = "SELECT total_count FROM carts WHERE cart_id = ?";

    try {
        var count_change = await con.query(update_item_count, [count, cart_id, item_id]);
        var store_total  = await con.query(sum_and_update, [cart_id, cart_id]); 
        var get_total    = await con.query(get_count, [cart_id]);      

        req.session.cart_count = get_total[0].total_count;
        res.send("" + req.session.cart_count);

    } catch (err) {res.send("Error")}
});


router.post('/recalculate-totals', async function(req, res) {
    var cart_id = req.session.cart_id;

    try {
        var totals = await calc_cart_totals(cart_id);
        res.send(totals);
    } catch(err) {res.send("Error")}
})


router.post('/update-budget', async function(req, res) {
    var new_budget = req.body.budget;
    var cart_id = req.session.cart_id;

    var update_budget = "UPDATE carts SET remaining_budget = ? WHERE cart_id = ?";

    try {
        var update_result = await con.query(update_budget, [new_budget, cart_id]);
        req.session.remaining_budget = new_budget;
        res.send("");
    } catch (err) {res.send("Error")}
})


router.post('/checkout-cart', async function(req, res) {
    var cart_id = req.session.cart_id;
    var user_id = req.session.user_id;

    var set_checked_out = "UPDATE carts SET checked_out = 1 WHERE cart_id = ?";
    var new_user_cart   = "INSERT INTO carts (user_id) VALUES (?)";
    var reset_cart_id   = "UPDATE users SET cart_id = (SELECT LAST_INSERT_ID()) WHERE user_id = ?";
    var get_new_cart_id = "SELECT cart_id from users where user_id = ?";

    try {
        var checked_out_update = await con.query(set_checked_out, [cart_id]);
        var create_new_cart    = await con.query(new_user_cart, [user_id]);
        var reset_cart         = await con.query(reset_cart_id, [user_id]);
        var new_cart_id        = await con.query(get_new_cart_id, [user_id]);

        req.session.cart_id    = new_cart_id[0].cart_id;
        req.session.cart_count = 0;
        req.session.checked_out = 1;

        res.send("" + req.session.cart_count);
    } catch (err) {res.send("Error")}
});


/* @TODO: Move somewhere else */
/* Timer Update, also returns cart checkout status */
router.post('/update-timer', async function(req, res) {
    var remaining_time = req.body.remaining_time;
    var cart_id = req.session.cart_id;
    var update_timer = "UPDATE carts SET remaining_time = ? WHERE cart_id = ?;";

    try {
    var updated_timer = await con.query(update_timer, [remaining_time, cart_id]);
    req.session.remaining_time = remaining_time;
    res.send("" + req.session.checked_out);
    } catch (err) {res.send("Error")}
});

module.exports = router;
