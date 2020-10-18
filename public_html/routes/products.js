var express    = require('express');
var router     = express.Router();
var con        = require('./database.js'); //in routes file already
var async      = require('async');
const perPage  = 12;

var LEADER_SIZE = 10

/* How to put this in a separate file :( need to be used in both cart.js and here*/
async function get_leaderboard () {
    var get_leaderboard = "SELECT users.username, carts.health_total " + 
                          "FROM users INNER JOIN carts " + 
                          "ON users.cart_id=carts.cart_id order by health_total desc " + 
                          "LIMIT ?;"
    try {
        var leaderboard = await con.query(get_leaderboard, [LEADER_SIZE]);
    } catch (err) {
        console.log(err);
        res.send("ERROR");
    }
    return leaderboard;
}

/* auth to check if logged in */
function auth (req, res, next) {

    if (req.session.loggedin) {
        res.header('Cache-Control', 
        'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        return next();
    } else {
        res.redirect('/login');
    }
}

/* format the query strings for mySQL */
function product_parameters(category, sub, offset) {
    var query_params;
    if (sub == "all")
        query_params = {"categories"   : "WHERE category = ?",
                        "page_query"   : [category],
                        "product_query": [category, perPage, offset]}
    else
        query_params = {"categories"   : "WHERE category = ? AND subcategory = ?",
                        "page_query"   : [category, sub],
                        "product_query": [category, sub, perPage, offset]}
    return query_params;
}

/* Single product page - Needs nutrition info */
router.get('/:id', auth, async function(req, res) {

    var product_id   = req.params.id;
    get_product_page = 'SELECT * FROM products WHERE product_id = ?';

    try {
        var result =  await con.query(get_product_page, [product_id]);

        res.render('product.ejs', 
        {header     : "Product Details", 
         item       : result[0],
         cart_count : req.session.cart_count});

    } catch(err) {
        console.log(err);
    }
});


// MAKE CHECKS:
//         is page a number?
//         make sure filter isn't dumb
router.get('/:category/:subcategory', auth, async function(req, res) {

    var category    = req.params.category;
    var subcategory = req.params.subcategory || "all";
    var filter      = req.query.filter || "price";
    var page        = req.query.page   || 1;
    var offset      = (perPage * page) - perPage;
    filter          = (filter == "default" ? "price" : filter);
    var cart_id  = req.session.cart_id;

    var query_params  = product_parameters(category, subcategory, offset);
    var count_results = "SELECT COUNT(product_id) as numberOfProducts " +
                        "FROM products " + query_params["categories"];
    var get_products  = "SELECT * FROM products " + query_params["categories"] + 
                       " ORDER BY " + filter + " LIMIT ? OFFSET ?";
    var get_listItems = "SELECT DISTINCT L.* FROM shoppingList L LEFT JOIN " +
                        "cart_items C ON L.listID = C.listID AND C.cart_id = ? " +
                        "WHERE C.listID IS NULL";

    try {
        var page_result = await con.query(count_results, query_params["page_query"]);
        var total_pages = Math.ceil(page_result[0].numberOfProducts / perPage);
        var products    = await con.query(get_products, query_params["product_query"]);
        var list        = await con.query(get_listItems, [cart_id]);    
        var leaderboard = await get_leaderboard();

        console.log(leaderboard)
        console.log("did it show anything?")

        var header = category + " - " + subcategory;
        header     = header.replace(/_/g, " ");
    
        var render_params = {
                header       : header,
                items        : products,
                listItems    : list,
                filter       : filter,
                cart_count   : req.session.cart_count,
                current_page : page,
                pages        : (page <= total_pages ? total_pages : 0),
                leaderboard  : leaderboard
            }      
        res.render('sample-aisle', render_params);

    } catch (err) {
        console.log(err);
        res.send("ERROR");
    }
});

module.exports = router;