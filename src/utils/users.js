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
                console.log(`User with id ${_user.id} not found. Creating user`);
                USERS.register_nfb_user(_user, (res) => {

                    if (!res) return false;

                    USERS.get_nfb_user(_user, _cb);
                });
                return;
            }

            var user = result[0]

            if (user.parts !== null) user.parts = JSON.parse(user.parts);
            if (user.tempPart !== null) user.tempPart = JSON.parse(user.tempPart);

            return _cb(user);
        });
    },

    update_nfb_user(_user) {
        var sql_fields = [];
        
        if (_user.parts !== null) _user.parts = JSON.stringify(_user.parts);
        if (_user.tempPart !== null) _user.tempPart = JSON.stringify(_user.tempPart);

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

        DB.query(sql, function (err, result) {
            if (err) {
                //console.log(err)
                return false;
            }
            
            if (!result || result.length) return false;

            return _cb(result);
        });
    },

    async get_nfb(nfb, _cb) {
        var sql = `SELECT * FROM nfbs WHERE ID = "${nfb}"`;

        DB.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                return false;
            }

            if (!result || result.length === 0) {
                // add user to db
                
                
                return _cb(true);
            }

            return _cb(false);
        });
    },

    add_nfb(nfb) {
        var sql = `INSERT INTO nfbs (ID, nfbLink) VALUES ("${nfb.name}", "${nfb.link}")`;

        DB.query(sql, function (err, result) {
            if (err) {
                //console.log(err)
                return false;
            }
            
            if (!result || result.length) return false;
        });
    },
}