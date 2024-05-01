const { setup_db } = require("./utils/database");
const { GetImages } = require("./utils/nfbFunctions");

module.exports = {
    init() {
        this.init_globals();
    },

    init_globals() {
        console.log("--- init globals ---");
        global.IMAGEFOLDERS = ['Backgrounds', 'Borbs', 'Frames', 'Items'];
        global.IMAGES = GetImages();
        global.DB = setup_db();
        global.USERS = require("./utils/users.js");
    }
}