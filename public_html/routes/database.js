var mysql = require('mysql');
var util  = require('util')

var pool = mysql.createPool({
    connectionLimit: 10,
    host     : 'mysql-user.eecs.tufts.edu',
    user     : 'nutritionStudy',
    password : 'walmart',
    database : 'nutritionStudy'
});

// pool.connect(function(err) {
//     if (err) throw err;
//     console.log("Connected!");
// });

pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.')
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.')
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.')
        }
    }
    if (connection) connection.release()
    return
})

pool.query = util.promisify(pool.query) //make all querys into promises.

module.exports = pool;