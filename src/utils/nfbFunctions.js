const fs = require('fs');
const Jimp = require("jimp");
const folders = ['Backgrounds', 'Borbs', 'Frames', 'Items'];
const image_directory = './src/Bits/';
const splitSymbol = "_";


// Get images from images folder
function GetImages() {
    let files = {};

    for (var i = 0; i < folders.length; i++) {

        files[folders[i]] = fs.readdirSync(image_directory + folders[i] + "/").map(file => {
            if (!file.endsWith(".png")) console.log(file);
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

    for (var i = 0; i < folders.length; i++) {
        if (rates[i] === 100 || getRndInteger(0, 100) <= rates[i]) {
            let frameImage = GetRandomPart(folders[i]);
            imagePaths.push(frameImage[0]);
            imageName += ((i === 0) ? "" : splitSymbol) + frameImage[1];
            parts[folders[i]] = frameImage[1];
        }
        else {
            parts[folders[i]] = "";
        }
    }

    await USERS.get_nfb(imageName, (newNfb) => {  
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

function GetPartsInfo(parts) {
    let imagePaths = []
    let imageName = ""
    for (var i = 0; i < folders.length; i++) {
        if (parts[folders[i]] === "") continue;
        let path = image_directory + folders[i] + "/" + parts[folders[i]] + ".png";
        imagePaths.push(path);
        imageName += ((i === 0) ? "" : splitSymbol) + parts[folders[i]];
    }

    return [imagePaths, imageName, parts];
}


function GetRandomPart(part) {
    let borbImage = IMAGES[part][getRndInteger(0, IMAGES[part].length)]
    let imagePath = image_directory + part + "/" + borbImage
    let imageName = borbImage.split(".")[0];

    return [imagePath, imageName];
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
    GetImages,
    CreateRandomNFB,
    GetRandomPart,
    CombineImages,
    GetPartsInfo,
    getRndInteger
}