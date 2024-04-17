const fs = require('fs');

async function CreateNFB() {
    
}

// Get images from images folder
function GetImages() {
    const image_directory = './src/Bits/';
    const folders = ['Backgrounds', 'Borbs', 'Frames', 'Items'];
    let files = {};
    
    for (var i = 0; i < folders.length; i++) {

        files[folders[i]] = fs.readdirSync(image_directory + folders[i] + "/").map(file => {
            return file;
        });    
    }
    console.log(`Borb count: ${files.Borbs.length}\nBackgrounds count: ${files.Backgrounds.length}\nFrames count: ${files.Frames.length}\nItems count: ${files.Items.length}`)
    return files;
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function CreateRandomNFB(tries = 0) {
    let rates = [100, 100, 100, 100]; // Rates to get each of the parts

    const image_directory = './src/Bits/';
    const folders = ['Backgrounds', 'Borbs', 'Frames', 'Items'];

    let splitSymbol = "_";

    let imagePaths = []
    let imageName = ""

    for (var i = 0; i < folders.length; i++) {
        if (rates[i] === 100 || getRndInteger(0, 100) <= rates[i]) {
            let frameImage = GetRandomPart(folders[i]);
            imagePaths.push(frameImage[0]);
            imageName += ((i === 0) ? "" : splitSymbol) + frameImage[1];

        }
    } 


    if (tries > 20) {
        console.log("No NFB could be created!");
        return null;
    }

    /*if (nfbs.includes(imageName)) {
        console.log("NFB already exist... creating new one");
        let newNFB = CreateRandomNFB(IMAGES.Borbs, IMAGES.Backgrounds, IMAGES.Frames, IMAGES.Items, tries + 1);
        if (!newNFB) return null;
        imagePaths = newNFB[0];
        imageName = newNFB[1];
    }*/

    return [imagePaths, imageName];
}

function GetRandomPart(part) {
    const image_directory = './src/Bits/';
    let borbImage = IMAGES[part][getRndInteger(0, IMAGES[part].length)]
        let imagePath = image_directory + part +"/" + borbImage
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
    getRndInteger
}