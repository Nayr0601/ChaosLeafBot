const BaseSlashCommand = require('../utils/BaseSlashCommand')
const { SlashCommandBuilder } = require('discord.js');
const Jimp = require("jimp");
const fsp = require('fs/promises');
const { CreateRandomNFB, getRndInteger, GetRandomPart } = require('../utils/nfbFunctions');

module.exports = class AddChaosLeavesCommand extends BaseSlashCommand {
    constructor() {
        super('nfb', 'NFB commands')
    }

    async run(client, interaction) {
        const subGroup = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();
        const PRICE = 50;
        const userID = interaction.user.id;
        const user = interaction.user;

        let replyMessage = await interaction.deferReply({ ephemeral: false });

        if (subGroup === null) {

            if (subcommand === 'show') {

                const userID = interaction.options.get('user') ? interaction.options.get('user').value : interaction.user.id;
                const targetUser = interaction.options.get('user') ? await client.users.fetch(userID) : interaction.user;
                USERS.get_nfb_user(targetUser, (target) => {

                    if (target == false || !target.nfbLink) {
                        return interaction.editReply(`${targetUser.username} don't have a NFB`);
                    }
                    else {
                        return interaction.editReply(`${target.nfbLink}`);
                    }
                });
            }
            else if (subcommand === 'pet') {
                USERS.get_nfb_user(user, (userData) => {
                    let amount = getRndInteger(10, 25);

                    userData.Borbcoins += amount;

                    USERS.update_nfb_user(userData);

                    return interaction.editReply({ content: `You pet a borb and got ${amount} borbcoins\n**New Balance:** ${userData.Borbcoins}` });
                });
            }


            else if (subcommand === 'create') {
                let userID = interaction.user.id;
                let user = interaction.user.username;
                let imageUrl;

                var sql = `SELECT * FROM users WHERE ID = "${userID}" LIMIT 1`;
                let userData;
                DB.query(sql, function (err, result) {
                    if (err) {
                        console.log(err)
                        //return interaction.editReply({ content: `An error occurred while connecting to the database`, ephemeral: true });
                    }

                    userData = result;
                    if (result.length == 0 || !userData || userData[0].Borbcoins < PRICE) {
                        console.log("Not enough coins")

                        return interaction.editReply({ content: `Not enough Borbcoins`, ephemeral: false });
                    }

                    userData = result[0];

                    let images = CreateRandomNFB();

                    console.log(images[1]);

                    //an array of all images we're using. MAKE SURE THEIR SIZES MATCH

                    var jimps = []
                    const tempFile = "NFB.png";
                    //turns the images into readable variables for jimp, then pushes them into a new array
                    for (var i = 0; i < images[0].length; i++) {
                        jimps.push(Jimp.read(images[0][i]))
                    }
                    //creates a promise to handle the jimps


                    Promise.all(jimps).then(function (data) {
                        return Promise.all(jimps)
                    }).then(async function (data) {

                        // --- THIS IS WHERE YOU MODIFY THE IMAGES --- \\

                        for (var i = 1; i < jimps.length; i++) {
                            data[0].composite(data[i], 0, 0)
                        }

                        //data[0]
                        //this saves our modified image
                        await data[0].writeAsync(tempFile);  // Wait for the image to be written.
                        replyMessage = await interaction.editReply({
                            files: [{
                                attachment: tempFile,
                                name: images[1] + '.png',
                            }],
                        });

                        interaction.channel.messages.fetch(replyMessage.id)
                            .then(message => {
                                imageUrl = message.attachments.first().url;
                            })
                            .catch(console.error);

                        await fsp.unlink(tempFile);
                    }).then(() => {


                        var sql = `SELECT * FROM users WHERE ID = "${userID}"`;


                        let newBal = userData.Borbcoins - PRICE;


                        var sql = `UPDATE users SET nfbLink = "${imageUrl}", Borbcoins = "${newBal}" WHERE ID = "${userID}"`;
                        DB.query(sql, function (err, result) {
                            if (err) {
                                console.log(err)
                                //return interaction.editReply({ content: `An error occurred while connecting to the database`, ephemeral: true });
                            }
                            //return interaction.editReply({ content: `Updated ${user.username}'s nfb to ${nfbLink}`});
                        });
                    })
                })
            }

            else if (subcommand === 'remove') {
                const userID = interaction.options.get('user').value
                const user = client.users.fetch(userID)

                var sql = `DELETE FROM users WHERE ID = "${userID}"`;
                var userData;
                DB.query(sql, function (err, result) {
                    if (err) {
                        console.log(err)
                        return interaction.editReply({ content: `An error occurred while connecting to the database`, ephemeral: true });
                    }
                    return interaction.editReply({ content: `${user.username}'s nfb removed` });
                });
            }

            else if (subcommand === 'update') {
                const userID = interaction.options.get('user').value
                const user = client.users.fetch(userID)
                const nfbLink = interaction.options.get('link').value;

                var sql = `SELECT * FROM users WHERE ID = "${userID}"`;
                var userData;
                DB.query(sql, function (err, result) {
                    if (err) {
                        console.log(err)
                        return interaction.editReply({ content: `An error occurred while connecting to the database`, ephemeral: true });
                    }
                    userData = result;
                    if (result.length == 0) {
                        var sql = `INSERT INTO users (ID, nfbLink) VALUES ("${userID}", "${nfbLink}")`;
                        DB.query(sql, function (err, result) {
                            if (err) {
                                console.log(err)
                                return interaction.editReply({ content: `An error occurred while connecting to the database`, ephemeral: true });
                            }
                            return interaction.editReply({ content: `Gave ${user.username}: ${nfbLink}` });
                        });
                    }
                    else {
                        var sql = `UPDATE users SET nfbLink = "${nfbLink}" WHERE ID = "${userID}"`;
                        DB.query(sql, function (err, result) {
                            if (err) {
                                console.log(err)
                                return interaction.editReply({ content: `An error occurred while connecting to the database`, ephemeral: true });
                            }
                            return interaction.editReply({ content: `Updated ${user.username}'s nfb to ${nfbLink}` });
                        });
                    }
                });
            }

            else if (subcommand === 'droptable') {
                //var sql = `CREATE TABLE users (ID varchar(32), nfbLink varchar(500) DEFAULT "", currentPart varchar(500) DEFAULT "", Borbcoins int DEFAULT 0)`;
                //var sql = `DROP TABLE users`;
                //var sql = `ALTER TABLE users MODIFY ID varchar(32) NOT NULL;`
                //var sql = `ALTER TABLE users MODIFY nfbLink varchar(255) DEFAULT "";`
                //var sql = `ALTER TABLE users ADD currentPart varchar(255) DEFAULT "";` 
                //var sql = `ALTER TABLE users MODIFY Borbcoins int DEFAULT "0"`;
                var userData;
                DB.query(sql, function (err, result) {
                    if (err) {
                        console.log(err)
                        return interaction.editReply({ content: `An error occurred while connecting to the database`, ephemeral: true });
                    }

                    return interaction.editReply({ content: `Table create`, ephemeral: true })
                });
            }

            else if (subcommand === 'give') {
                const userID = interaction.options.get('user').value
                const user = client.users.fetch(userID)
                const amount = interaction.options.get('amount').value;

                var sql = `SELECT * FROM users WHERE ID = "${userID}"`;
                var userData;
                DB.query(sql, function (err, result) {
                    if (err) {
                        console.log(err)
                        return interaction.editReply({ content: `An error occurred while connecting to the database`, ephemeral: true });
                    }
                    userData = result[0];
                    if (result.length === 0) {
                        var sql = `INSERT INTO users (ID, nfbLink, Borbcoins) VALUES ("${userID}", "", "${amount}")`;
                        DB.query(sql, function (err, result) {
                            if (err) {
                                console.log(err)
                                return interaction.editReply({ content: `An error occurred while connecting to the database`, ephemeral: true });
                            }
                            return interaction.editReply({ content: `Gave ${user.username}: ${amount} borbcoins.` });
                        });
                    }
                    else {
                        let newTotal = userData.Borbcoins + amount;
                        var sql = `UPDATE users SET Borbcoins = "${newTotal}" WHERE ID = "${userID}"`;
                        DB.query(sql, function (err, result) {
                            if (err) {
                                console.log(err)
                                return interaction.editReply({ content: `An error occurred while connecting to the database`, ephemeral: true });
                            }
                            return interaction.editReply({ content: `Gave ${amount} borbcoins to ${user.username}. New Balance: ${newTotal}` });
                        });
                    }
                });
            }
            else if (subcommand === 'buy') {
                const partString = interaction.options.get('part').value

                const part = GetRandomPart(partString)

                console.log(part);

                return interaction.editReply({ content: `Not implemented yet :skull:` });

                var sql = `SELECT * FROM users WHERE ID = "${userID}"`;
                var userData;
                DB.query(sql, function (err, result) {
                    if (err) {
                        console.log(err)
                        return interaction.editReply({ content: `An error occurred while connecting to the database`, ephemeral: true });
                    }
                    userData = result;
                    if (result.length == 0) {
                        var sql = `INSERT INTO users (ID, nfbLink) VALUES ("${userID}", "${nfbLink}")`;
                        DB.query(sql, function (err, result) {
                            if (err) {
                                console.log(err)
                                return interaction.editReply({ content: `An error occurred while connecting to the database`, ephemeral: true });
                            }
                            return interaction.editReply({ content: `Gave ${user.username}: ${nfbLink}` });
                        });
                    }
                    else {
                        var sql = `UPDATE users SET nfbLink = "${nfbLink}" WHERE ID = "${userID}"`;
                        DB.query(sql, function (err, result) {
                            if (err) {
                                console.log(err)
                                return interaction.editReply({ content: `An error occurred while connecting to the database`, ephemeral: true });
                            }
                            return interaction.editReply({ content: `Updated ${user.username}'s nfb to ${nfbLink}` });
                        });
                    }
                });


                return replyMessage = interaction.editReply({
                    content: `Would you like exchance **current part** for ${part[1]}?`,
                    files: [{
                        attachment: part[0],
                        name: part[1] + ".png",
                    }],
                });

            }
        }

    }

    getSlashCommandJSON() {
        return new SlashCommandBuilder()
            .setName(this._name)
            .setDescription(this._description)
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('show')
                    .setDescription('Show Players nfb')
                    .addUserOption((option) =>
                        option.setName('user')
                            .setDescription('Users nfb you want to see')
                    )
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('pet')
                    .setDescription('Pet borb')
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('create')
                    .setDescription('Create NFB')
                /*.addStringOption((option) =>
                    option
                    .setName('borb')
                    .setDescription('Borb')
                    .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                    .setName('background')
                    .setDescription('Background')
                    .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                    .setName('frame')
                    .setDescription('Frame')
                    .setRequired(true)
                )*/
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('remove')
                    .setDescription('Delete players NFB')
                    .addUserOption((option) =>
                        option.setName('user')
                            .setDescription('The users NFB to remove')
                            .setRequired(true)
                    )
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('update')
                    .setDescription('Update player nfb with image')
                    .addUserOption((option) =>
                        option.setName('user')
                            .setDescription('User to update')
                            .setRequired(true)
                    )
                    .addStringOption((option) =>
                        option
                            .setName('link')
                            .setDescription('Link to NFB')
                            .setRequired(true)
                    )
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('buy')
                    .setDescription('Update nfb')
                    .addStringOption(option =>
                        option.setName('part')
                            .setDescription('NFB Part picker')
                            .setRequired(true)
                            .addChoices(
                                { name: 'Borb', value: 'Borbs' },
                                { name: 'Background', value: 'Backgrounds' },
                                { name: 'Frame', value: 'Frames' },
                                { name: 'Item', value: 'Items' },
                            ))
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('give')
                    .setDescription('Give player Borbcoins')
                    .addUserOption((option) =>
                        option.setName('user')
                            .setDescription('User to give Borbcoins')
                            .setRequired(true)
                    )
                    .addIntegerOption((option) =>
                        option
                            .setName('amount')
                            .setDescription('Borbcoins to give')
                            .setRequired(true)
                            .setMinValue(1)
                    )
            )
        /*.addSubcommand((subcommand) =>
            subcommand
                .setName('droptable')
                .setDescription('Droptable')
        )*/

    }
}