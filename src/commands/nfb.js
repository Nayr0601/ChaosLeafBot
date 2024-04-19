const BaseSlashCommand = require('../utils/BaseSlashCommand')
const { SlashCommandBuilder } = require('discord.js');
const { CreateRandomNFB, getRndInteger, GetPartsInfo, GetRandomPart, CombineImages } = require('../utils/nfbFunctions');

module.exports = class AddChaosLeavesCommand extends BaseSlashCommand {
    constructor() {
        super('nfb', 'NFB commands')
    }

    async run(client, interaction) {
        const subGroup = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();
        const NFB_PRICE = 200;
        const NFB_PART_PRICE = 60;
        const userID = interaction.user.id;
        const user = interaction.user;

        let replyMessage = await interaction.deferReply({ ephemeral: false });

        if (subGroup === null) {

            if (subcommand === 'show') {

                const userID = interaction.options.get('user') ? interaction.options.get('user').value : interaction.user.id;
                const targetUser = interaction.options.get('user') ? await client.users.fetch(userID) : interaction.user;

                console.log(Date.now());

                USERS.get_nfb_user(targetUser, (target) => {

                    console.log(target);
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
                USERS.get_nfb_user(user, async (userData) => {

                    if (!userData || userData.Borbcoins < NFB_PRICE) {
                        console.log("Not enough coins")

                        return interaction.editReply({ content: `Not enough Borbcoins. It cost **${NFB_PRICE}** borbcoins to create a borb. Current balance: ${userData.Borbcoins}`, ephemeral: false });
                    }

                    CreateRandomNFB((images) => {

                        if (!images) return interaction.editReply({ content: `Couldn't make a new nfb`, ephemeral: false });
                        let oldNfb = userData.parts != null ? { "id": GetPartsInfo(userData.parts)[1], "currentOwner": "" } : null;

                        CombineImages(images, async (tempFile) => {
                            // Maybe send this in a hidden channel and reply with the link to the image
                            replyMessage = await interaction.editReply({
                                files: [{
                                    attachment: tempFile,
                                    name: images[1] + '.png',
                                }],
                            });

                            // Get the link to the image send above
                            let imageUrl = replyMessage.attachments.first().url;

                            userData.Borbcoins -= NFB_PRICE;
                            userData.nfbLink = imageUrl;
                            userData.parts = images[2];
                            USERS.update_nfb_user(userData);
                            USERS.update_nfbs({ "id": images[1], "nfbLink": imageUrl, "currentOwner": user.id, "timesCreated": images[3].timesCreated + 1 }, oldNfb);
                        });
                    });
                })
            }

            else if (subcommand === 'remove') {
                const userID = interaction.options.get('user').value
                const targetUser = await client.users.fetch(userID)

                USERS.get_nfb_user(targetUser, (userData) => {

                    if (userData.nfbLink === "")
                        return interaction.editReply({ content: `${targetUser.username} don't have an nfb.` });

                    userData.nfbLink = "";

                    USERS.update_nfb_user(userData);
                    return interaction.editReply({ content: `${targetUser.username}'s nfb have been removed` });
                });
            }

            else if (subcommand === 'update') {
                const userID = interaction.options.get('user').value
                const targetUser = await client.users.fetch(userID)
                const nfbLink = interaction.options.get('link').value;

                USERS.get_nfb_user(targetUser, (userData) => {
                    userData.nfbLink = nfbLink;

                    USERS.update_nfb_user(userData);
                    return interaction.editReply({ content: `Updated ${targetUser.username}'s nfb to ${nfbLink}` });
                });
            }

            else if (subcommand === 'droptable') {
                //var sql = `CREATE TABLE users (ID varchar(32) NOT NULL, nfbLink varchar(500) DEFAULT "", parts JSON, tempPart JSON, Borbcoins int DEFAULT 0, UNIQUE (ID))`;
                //var sql = `DROP TABLE users`;
                var sql = `DROP TABLE nfbs`;

                DB.query(sql, function (err, result) {
                    if (err) {
                        console.log(err)
                        return interaction.editReply({ content: `An error occurred while connecting to the database`, ephemeral: true });
                    }

                    return interaction.editReply({ content: `Dropped table`, ephemeral: true })
                });
            }
            else if (subcommand === 'createtable') {
                //var sql = `CREATE TABLE users (ID varchar(32) NOT NULL, nfbLink varchar(500) DEFAULT "", parts JSON, tempPart JSON, Borbcoins int DEFAULT 0, UNIQUE (ID))`;
                var sql = `CREATE TABLE nfbs (ID varchar(255) NOT NULL, nfbLink varchar(500) DEFAULT "", currentOwner varchar(32) DEFAULT "", firstCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP, lastCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, timesCreated INT DEFAULT 0, UNIQUE (ID))`;
                //var sql = `ALTAR TABLE nfbs ADD Created TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;

                DB.query(sql, function (err, result) {
                    if (err) {
                        console.log(err)
                        return interaction.editReply({ content: `An error occurred while connecting to the database`, ephemeral: true });
                    }

                    return interaction.editReply({ content: `Created table`, ephemeral: true })
                });
            }


            else if (subcommand === 'give') {
                const userID = interaction.options.get('user').value
                const targetUser = await client.users.fetch(userID)
                const amount = interaction.options.get('amount').value;

                USERS.get_nfb_user(targetUser, (userData) => {

                    userData.Borbcoins += amount;


                    USERS.update_nfb_user(userData);

                    return interaction.editReply({ content: `Gave ${amount} borbcoins to ${targetUser.username}. New Balance: ${userData.Borbcoins}` });
                });
            }

            else if (subcommand === 'buy') {
                USERS.get_nfb_user(user, (userData) => {
                    const partString = interaction.options.get('part').value
                    if (userData.Borbcoins < NFB_PART_PRICE) return interaction.editReply({ content: `Not enough Borbcoins. Cost **${NFB_PART_PRICE}** borbscoins. **Current balance:** ${userData.Borbcoins}.`, ephemeral: false });
                    const part = GetRandomPart(partString)
                    
                    userData.Borbcoins -= NFB_PART_PRICE;
                    replyMessage = interaction.editReply({
                        content: `Would you like replace **${userData.parts[partString]}** with **${part[1]}**?\nUse **/nfb merge** to create you new borb\n**New balance:** ${userData.Borbcoins}`,
                        files: [{
                            attachment: part[0],
                            name: part[1] + ".png",
                        }],
                    });
                    userData.tempPart = {
                        "name": part[1],
                        "partType": [partString],
                    }
                    USERS.update_nfb_user(userData)
                });
            }
            else if (subcommand === 'info') {
                const userID = interaction.options.get('user') ? interaction.options.get('user').value : interaction.user.id;
                const targetUser = interaction.options.get('user') ? await client.users.fetch(userID) : interaction.user;

                USERS.get_nfb_user(targetUser, (userData) => {
                    var nfbId = GetPartsInfo(userData.parts)[1];

                    USERS.get_nfb(nfbId, (_nfb) => {
                        if (!_nfb) return interaction.editReply({
                            content: `No info found!`
                        });

                        var firstDate = new Date(_nfb.firstCreated);
                        var lastDate = new Date(_nfb.lastCreated);

                        var info;
                        if (firstDate.getTime() == lastDate.getTime()) {
                            info = `**Created:** ${firstDate.toLocaleDateString("en-GB")} ${firstDate.toLocaleTimeString("en-US")}`
                        }
                        else {
                            info = `**First created:** ${firstDate.toLocaleDateString("en-GB")} ${firstDate.toLocaleTimeString("en-US")}` +
                            `\n**Last created:** ${lastDate.toLocaleDateString("en-GB")} ${lastDate.toLocaleTimeString("en-US")}`;
                        }

                        info += `**\nTimes created:** ${_nfb.timesCreated}`
                        
                        replyMessage = interaction.editReply({
                            content: _nfb.nfbLink
                        });
                        return interaction.channel.send(`**Current owner: **${targetUser.username}\n${info}`);
                    });
                });
            }
            else if (subcommand === 'merge') {
                USERS.get_nfb_user(user, (userData) => {

                    if (userData.nfbLink === "")
                        return interaction.editReply({ content: `You need to create a nfb first.` });


                    if (userData.tempPart === null)
                        return interaction.editReply({ content: `You need to buy a part first with /nfb buy` });

                        // Get name of current NFB
                    var oldNfbName = GetPartsInfo(userData.parts)[1];

                    let parts = userData.parts

                    // Replace part of NFB with bought part.
                    parts[userData.tempPart.partType] = userData.tempPart.name;

                    // Get info about nfb
                    let images = GetPartsInfo(parts)

                    USERS.get_nfb(images[1], (newNfb) => {
                        if (!newNfb) return interaction.editReply({ content: `This nfb already exist`, ephemeral: false });
                        CombineImages(images, async (tempFile) => {

                            // ------------------------------------------------------------------------- \\
                            // ------------------------------------------------------------------------- \\
                            // Maybe send image in a hidden channel and reply with the link to the image \\
                            // ------------------------------------------------------------------------- \\
                            // ------------------------------------------------------------------------- \\

                            let replyMessage = await interaction.editReply({
                                content: `Part merged`,
                                files: [{
                                    attachment: tempFile,
                                    name: images[1] + '.png',
                                }],
                            });

                            // Get the link to the image send above
                            let imageUrl = replyMessage.attachments.first().url;

                            userData.Borbcoins -= NFB_PRICE;
                            userData.nfbLink = imageUrl;
                            userData.parts = images[2];
                            userData.tempPart = null;

                            USERS.update_nfb_user(userData);
                            USERS.update_nfbs({ "id": images[1], "nfbLink": imageUrl, "currentOwner": user.id }, { "id": oldNfbName, "currentOwner": "", "timesCreated": newNfb.timesCreated + 1 });
                        })
                    });
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
                    .setDescription('Buy a random part from a specific category')
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
            ).addSubcommand((subcommand) =>
                subcommand
                    .setName('merge')
                    .setDescription('Replace a part of your nfb with another')
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('info')
                    .setDescription('Get Info about your nfb')
                    .addUserOption((option) =>
                        option.setName('user')
                            .setDescription('Info about users nfb')
                    )
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
                            .setMinValue(-10000)
                    )
            )/*
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('droptable')
                    .setDescription('Droptable')
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('createtable')
                    .setDescription('Createtable')
            )*/
    }
}