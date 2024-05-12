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

    // Work in progress. Getting both user data and nfb with one call. 
    get_nfb_user_with_nfb(_user, _cb) {
        var sql = `SELECT * FROM users LEFT JOIN nfbs ON users.ID = nfbs.currentOwner`;

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

                    USERS.get_nfb_user_with_nfb(_user, _cb);
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

        delete _user.currentOwner;
        delete _user.firstCreated;
        delete _user.lastCreated;
        delete _user.timesCreated;

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

    add_nfb(_nfb, _cb) {
        var sql = `INSERT INTO nfbs (nfbID) VALUES ("${_nfb}")`;

        DB.query(sql, function (err, result) {
            if (err) {
                //console.log(err)
                return false;
            }

            if (!result || result.length) return false;

            return _cb(result);
        });
    },

    async get_nfb(_nfb, _cb) {
        var sql = `SELECT * FROM nfbs WHERE nfbID = "${_nfb}"`;

        DB.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                return false;
            }

            if (!result || result.length === 0) {
                // nfb doesn't exist yet or isn't owned by anyone
                USERS.add_nfb(_nfb, (res) => {
                    if (!res) return false;

                    USERS.get_nfb(_nfb, _cb);
                });
                return false;
            }

            return _cb(result[0]);
        });
    },

    update_nfb(_nfb) {
        var sql_fields = []
        console.log(`UPDATING NFB!`)
        console.log(_nfb)
        for (const [key, value] of Object.entries(_nfb)) {
            console.log(`Key value pair = ${key}: ${value}`);
            sql_fields.push(`${key} = :${key}`);
        }

        var sql = `UPDATE nfbs SET ${sql_fields.join(", ")} WHERE nfbID = "${_nfb.nfbID}"`;
        var sql_post = _nfb;

        DB.query(sql, sql_post, function (err, result) {
            if (err) {
                console.log(err)
                return false;
            }


            if (!result || result.length) return false;
        });
    },

    update_nfbs(newNfb, oldNfb) {
        USERS.update_nfb(newNfb);
        if (oldNfb != null) USERS.update_nfb(oldNfb);
    },

    // PART VALUE
    add_part(_name, _partType) {
        var sql = `INSERT INTO Parts (ID, PartType) VALUES ("${_name}", "${_partType}")`;

        DB.query(sql, function (err, result) {
            if (err) {
                //console.log(err)
                return false;
            }

            if (!result || result.length) return false;

            return true;
        });
    },

    get_part(_partId, _partType, _cb) {
        var sql = `SELECT * FROM Parts WHERE ID = "${_partId}" AND PartType = "${_partType}"`;

        DB.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                return false;
            }

            if (!result || result.length === 0) {
                return false;
            }

            return _cb(result[0]);
        });
    },


    get_nfb_value(_userData, _cb) {
        var sql_fields = []
        for (const [key, value] of Object.entries(_userData.parts)) {
            //console.log(`${key}: ${value}`);
            sql_fields.push(`(ID = "${value}" AND PartType = "${key}")`);
        }
        sql_post = _userData.parts;

        var sql = `SELECT SUM(pValue) FROM Parts WHERE ${sql_fields.join(" OR ")}`;

        DB.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                return false;
            }

            if (!result || result.length === 0) {
                return false;
            }

            //console.log("Value: " + result[0][Object.keys(result[0])[0]]);
            return _cb(result[0][Object.keys(result[0])[0]]);
        });
    },


    update_part(_part) {
        var sql = `UPDATE Parts SET pValue = ${_part.pValue} WHERE ID = "${_part.ID}" AND PartType = "${_part.PartType}"`;
        console.log(_part);
        DB.query(sql, function (err, result) {
            if (err) {
                console.log(err)
                return false;
            }
            if (!result || result.length) return false;
        });
    },

    update_parts(_user, _fullInvestment) {
        var investmentPerPart = _fullInvestment / 4;
        console.log("UPDATING PARTS")
        for (var i = 0; i < IMAGEFOLDERS.length; i++) {
            var partType = IMAGEFOLDERS[i]
            USERS.get_part(_user.parts[partType], partType, (part) => {

                part.pValue += investmentPerPart;
                USERS.update_part(part);
            })

        }

    }
}