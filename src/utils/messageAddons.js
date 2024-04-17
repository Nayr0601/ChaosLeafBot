function splitMessage(message) {

}

function createLeaderboardMessage(dbResult, size) {
    var chunks = [];

    var lastPos = 1;

    var chunk = '<:chaos_leaf:1099496524800602163> **Leaderboard** <:chaos_leaf:1099496524800602163>\n';

    for (let i = 0; i < dbResult.length; i++) {
        let pos = i + 1;
        if (i > 0) {
            pos = dbResult[i].current == dbResult[i-1].current ? lastPos : i + 1;
        }

        let chunkPart = `#${pos}: ${dbResult[i].name} | **${dbResult[i].current}**\n`

        if (chunk.length + chunkPart.length < size) {
            chunk += chunkPart;
        } else {
            chunks.push(chunk);
            chunk = chunkPart;
        }
        lastPos = pos
    }

    chunks.push(chunk)

    return chunks;
}

module.exports = {
    splitMessage,
    createLeaderboardMessage,
}