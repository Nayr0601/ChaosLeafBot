const mysql = require('mysql');
module.exports = {
    get_nfb_user(_user, _cb) {
        var sql = `SELECT * FROM users WHERE ID = "${_user.id}"`;

        DB.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                return false;
            }

            if (!result || result.length === 0) {
                // add user to db
                USERS.register_nfb_user(_user, _cb);
                return;
            }

            var user = result[0]

            return _cb(user);
        });
    },

    update_nfb_user(_user) {
        var sql_fields = [];
        
        for (const [key, value] of Object.entries(_user)) {
            //console.log(`${key}: ${value}`);
            sql_fields.push(`${key} = :${key}`);
        }
        
        var sql = `UPDATE users SET ${sql_fields.join(", ")} WHERE ID = "${_user.ID}"`;
        var query_fields = _user;
        DB.query(sql, query_fields, function (err, result) {
            if (err) {
                console.log(err)
                return false;
            }
            
        });
    },

    register_nfb_user(_user, _cb) {
        var sql = `INSERT INTO users (ID) VALUES ("${_user.id}")`;
        console.log(_user);
        DB.query(sql, function (err, result) {
            if (err) {
                console.log(err)
                return false;
            }
            
            if (!result || result.length) return false;

            return _cb(result);
        });
    },
}