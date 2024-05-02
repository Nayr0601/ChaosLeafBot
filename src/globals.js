const { setup_db } = require("./utils/database");

module.exports = {
    init() {
        this.init_globals();
    },

    init_globals() {
        console.log("--- init globals ---");
        global.IMAGEFOLDERS = ['Backgrounds', 'Borbs', 'Frames', 'Items'];
        global.NFBCMDFUNC = require("./utils/nfbCommandFunctions.js");
        global.NFBHELPERFUNC = require("./utils/nfbFunctions.js");
        global.IMAGES = NFBHELPERFUNC.GetImages();
        global.DB = setup_db();
        global.USERS = require("./utils/users.js");


        // NFB Prices
        global.FIRST_NFB_PRICE = 50;
        global.INVEST_AMOUNT = 20;
        global.NFB_PRICE = 200;
        global.NFB_PART_PRICE = 60;
        global.SECONDS_TO_CREATE_NFB = 10;
    }
}