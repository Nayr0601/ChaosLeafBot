const { setup_db } = require("./utils/database");

module.exports = {
    init() {
        this.init_globals();
    },

    init_globals() {
        console.log("--- init globals ---");
        global.DB = setup_db();
        global.USERS = require("./utils/users.js");
        global.IMAGEFOLDERS = ['Backgrounds', 'Borbs', 'Frames', 'Items'];
        global.NFBCMDFUNC = require("./utils/nfbCommandFunctions.js");
        global.NFBHELPERFUNC = require("./utils/nfbFunctions.js");
        global.IMAGES = NFBHELPERFUNC.GetImages();


        // NFB Variables
        global.FIRST_NFB_PRICE = 52; // Should be a number divisible by 4
        global.INVEST_AMOUNT = 20;   // Should be a number divisible by 4
        global.NFB_PRICE = 200;      // Should be a number divisible by 4
        global.NFB_PART_PRICE = 60;  // Everything goes to the part
        global.SECONDS_TO_CREATE_NFB = 10;
    }
}