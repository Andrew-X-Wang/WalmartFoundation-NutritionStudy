var express  = require('express');
var router   = express.Router();
var con      = require('./database.js');

function auth (req, res, next) {

    if (req.session.loggedin) {
        res.header('Cache-Control', 
        'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        return next();
    }

    res.redirect('/login');
}

router.get('/', auth, async function(req, res) {

  // gets cart items from all previous carts
  var get_all_info = "SELECT * FROM carts INNER JOIN cart_items ON carts.cart_id = cart_items.cart_id " +
                     "INNER JOIN products ON cart_items.product_id = products.product_id " +
                     "WHERE (user_id = ?) AND (carts.checked_out = 1)";

  try {
    var all_carts = await con.query(get_all_info, [req.session.user_id]);

    res.render('past-purchases.ejs', 
    { header     : "Your Past Purchases", 
      items      : all_carts,
      cart_count : req.session.cart_count,
      tracking_budget : req.session.tracking_budget,
      tracking_time : req.session.tracking_time,
      start_time : req.session.session_start_time,
      total_time : req.session.total_time,
      remaining_time : req.session.remaining_time,
      total_budget : req.session.total_budget,
      remaining_budget : req.session.remaining_budget,
      checked_out : req.session.checked_out
    });

  } catch(err) { console.log(err); res.send("error"); }
});

module.exports = router;