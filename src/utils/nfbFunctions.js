const fs = require('fs');
const Jimp = require("jimp");
const image_directory = './src/Bits/';
const splitSymbol = "_";


function AddPartsToDB() {
    for (var i = 0; i < IMAGEFOLDERS.length; i++) {
        var partType = IMAGEFOLDERS[i]
        for (var j = 0; j < IMAGES[partType].length; j++) {
            USERS.add_part(IMAGES[partType][j], partType);
        }
    }
}


// Get images from images folder
function GetImages() {
    let files = {};

    for (var i = 0; i < IMAGEFOLDERS.length; i++) {

        files[IMAGEFOLDERS[i]] = fs.readdirSync(image_directory + IMAGEFOLDERS[i] + "/").map(file => {
            if (!file.endsWith(".png")) {
                console.log(file);
                return null;
            }
            file = file.split(".")[0]
            return file;
        });
    }
    console.log(`Borb count: ${files.Borbs.length}\nBackgrounds count: ${files.Backgrounds.length}\nFrames count: ${files.Frames.length}\nItems count: ${files.Items.length}`)
    return files;
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

async function CreateRandomNFB(_cb, tries = 0) {
    let rates = [100, 100, 100, 100]; // Rates to get each of the parts

    let imagePaths = []
    let imageName = ""
    let parts = {};

    for (var i = 0; i < IMAGEFOLDERS.length; i++) {
        if (rates[i] === 100 || getRndInteger(0, 100) <= rates[i]) {
            let frameImage = GetRandomPart(IMAGEFOLDERS[i]);
            imagePaths.push(frameImage[0]);
            imageName += ((i === 0) ? "" : splitSymbol) + frameImage[1];
            parts[IMAGEFOLDERS[i]] = frameImage[1];
        }
        else {
            parts[IMAGEFOLDERS[i]] = "";
        }
    }

    await USERS.get_nfb({ id: imageName, parts: parts }, (newNfb) => {
        if (tries >= 20) {
            console.log("No NFB could be created!");
            return _cb(null);
        }

        if (newNfb.currentOwner != "" && newNfb.currentOwner != null) {
            CreateRandomNFB(_cb, tries + 1);
        }
        else return _cb([imagePaths, imageName, parts, newNfb]);
    })
}

async function CombineImages(images, _cb) {
    var jimps = []
    const tempFile = "NFB.png";
    //turns the images into readable variables for jimp, then pushes them into a new array
    for (var i = 0; i < images[0].length; i++) {
        jimps.push(Jimp.read(images[0][i]))
    }


    //creates a promise to handle the jimps
    Promise.all(jimps).then(async function (data) {
        // --- COMBINE NFB PARTS --- \\
        for (var i = 1; i < jimps.length; i++) {
            data[0].composite(data[i], 0, 0)
        }

        //this saves our modified image
        await data[0].writeAsync(tempFile);  // Wait for the image to be written.

        await _cb(tempFile);

        fs.promises.unlink(tempFile);
    });
}

async function SendImageAndGetImageLink(fileName, file, interaction) {

    // ------------------------------------------------------------------------- \\
    // ------------------------------------------------------------------------- \\
    // Maybe send image in a hidden channel and reply with the link to the image \\
    // ------------------------------------------------------------------------- \\
    // ------------------------------------------------------------------------- \\

    let replyMessage = await interaction.editReply({
        content: `Part merged`,
        files: [{
            attachment: file,
            name: fileName + '.png',
        }],
    });

    // Get the link to the image send above
    let imageUrl = replyMessage.attachments.first().url;

    return imageUrl;
}

function GetPartsInfo(parts) {
    let imagePaths = []
    let imageName = ""
    for (var i = 0; i < IMAGEFOLDERS.length; i++) {
        if (parts[IMAGEFOLDERS[i]] === "") continue;
        let path = image_directory + IMAGEFOLDERS[i] + "/" + parts[IMAGEFOLDERS[i]] + ".png";
        imagePaths.push(path);
        imageName += ((i === 0) ? "" : splitSymbol) + parts[IMAGEFOLDERS[i]];
    }

    return [imagePaths, imageName, parts];
}


function GetRandomPart(part) {
    let borbImage = IMAGES[part][getRndInteger(0, IMAGES[part].length)]
    let imagePath = image_directory + part + "/" + borbImage + ".png"
    let imageName = borbImage;

    return [imagePath, imageName];
}

function GetPart(part, index) {
    if (IMAGES[part].length <= index) return false;
    let borbImage = IMAGES[part][index]
    let imagePath = image_directory + part + "/" + borbImage + ".png"
    let imageName = borbImage;

    return [imagePath, imageName];
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
    GetImages,
    CreateRandomNFB,
    GetRandomPart,
    GetPart,
    CombineImages,
    GetPartsInfo,
    getRndInteger,
    SendImageAndGetImageLink,
}