module.exports = {
    // --------------------------------------- \\
    //              Bal function               \\
    //  Show how many borbcoins a player have  \\
    // --------------------------------------- \\
    async bal(client, interaction) {
        const userID = interaction.options.get('user') ? interaction.options.get('user').value : interaction.user.id;
        const targetUser = interaction.options.get('user') ? await client.users.fetch(userID) : interaction.user;

        USERS.get_nfb_user(targetUser, (target) => {
            {
                return interaction.editReply(`**Current balance:** ${target.CurrentBorbcoins}`);
            }
        });
    },

    // --------------------------------------- \\
    //              Buy function               \\
    //          Buy a random nfb part          \\
    // --------------------------------------- \\
    async buy(client, interaction) {
        USERS.get_nfb_user_with_nfb(interaction.user, (userData) => {
            const partString = interaction.options.get('part').value

            if (userData.tempPart) return interaction.editReply(`You already have a part. Pls accept or decline that before buying a new part`);

            if (userData.CurrentBorbcoins < NFB_PART_PRICE)
                return interaction.editReply({ content: `Not enough Borbcoins. Cost **${NFB_PART_PRICE}** borbscoins. **Current balance:** ${userData.CurrentBorbcoins}.`, ephemeral: false });
            const part = NFBHELPERFUNC.GetRandomPart(partString)

            userData.CurrentBorbcoins -= NFB_PART_PRICE;
            replyMessage = interaction.editReply({
                content: `Would you like replace **${userData.parts[partString]}** with **${part[1]}**?\nUse **/nfb merge** to create you new borb\n**New balance:** ${userData.CurrentBorbcoins}`,
                files: [{
                    attachment: part[0],
                    name: part[1] + ".png",
                }],
            });
            userData.tempPart = {
                "name": part[1],
                "partType": partString,
            }

            USERS.update_nfb_user(userData)
        });
    },


    // --------------------------------------- \\
    //            Create function              \\
    //            Create a new nfb             \\
    // --------------------------------------- \\
    async create(client, interaction) {
        var user = interaction.user;
        const accepted = interaction.options.get('option') ? interaction.options.get('option').value : null;

        USERS.get_nfb_user_with_nfb(user, async (userData) => {

            // First time creating a nfb
            if (userData.nfbID == null && userData.CurrentBorbcoins < FIRST_NFB_PRICE) {
                return interaction.editReply({ content: `Not enough Borbcoins. Your first NFB cost **${FIRST_NFB_PRICE}** borbcoins. Current balance: ${userData.CurrentBorbcoins}` });
            }

            // Already have a nfb, but not enough borbcoins
            if (userData.CurrentBorbcoins < NFB_PRICE) {
                return interaction.editReply({ content: `Not enough Borbcoins. It cost **${NFB_PRICE}** borbcoins to create a NFB. Current balance: ${userData.CurrentBorbcoins}` });
            }

            // User have already created a temp nfb 
            if (userData.tempNfbID) {
                // User haven't given a second argument
                if (accepted == null) {
                    return interaction.editReply({ content: `You already have a nfb. Please decide if you want to keep it or by adding accept or decline after this command.` });
                } 

                // User have accepted the
                else if (accepted == 'accept') {
                    var oldNfbID = userData.nfbID;

                    let oldNfb = userData.oldNfbID != null ? { "nfbID": oldNfbID, "currentOwner": "" } : null;
                    userData.nfbID = userData.tempNfbID;
                    userData.tempNfbID = null;


                    // Update part values
                    USERS.update_parts(userData, NFB_PRICE);

                    // Update nfbs
                    await USERS.update_nfbs({ "nfbID": userData.nfbID, "currentOwner": user.id }, oldNfb);
                    USERS.update_nfb_user(userData);
                    
                    return interaction.editReply({ content: `Nfb Updated` });
                }
                else if (accepted == 'decline') {
                    userData.tempNfbID = null;

                    // Add borb coins to the nfb PRIME

                    USERS.update_nfb_user(userData);
                    return interaction.editReply({ content: `Nfb Declined` });
                }
            }


            NFBHELPERFUNC.CreateRandomNFB((images) => {
                if (!images) return interaction.editReply({ content: `Couldn't make a new nfb`, ephemeral: false });

                NFBHELPERFUNC.CombineImages(images, async (tempFile) => {
                    // Maybe send this in a hidden channel and reply with the link to the image
                    var messageContent = "Use /NFB Create Accept or /NFB Create Decline to accept or reject the new nfb";
                    if (userData.nfbID == null) {
                        messageContent = "You created your first nfb";
                    }

                    replyMessage = await interaction.editReply({
                        content: messageContent,
                        files: [{
                            attachment: tempFile,
                            name: images[1] + '.png',
                        }],
                    });

                    // Get the link to the image send above
                    let imageUrl = replyMessage.attachments.first().url;

                    
                    userData.CurrentBorbcoins -= userData.nfbLink == "" ? FIRST_NFB_PRICE : NFB_PRICE;

                    if (userData.nfbID == null) {
                        userData.nfbID = images[1];
                        userData.parts = images[2];
                        USERS.update_parts(userData, FIRST_NFB_PRICE);
                        await USERS.update_nfbs({ "nfbID": images[1], "nfbLink": imageUrl, "currentOwner": user.id, "timesCreated": images[3].timesCreated + 1 });
                    } 
                    else {
                        userData.tempNfbID = images[1];
                        await USERS.update_nfbs({ "nfbID": images[1], "nfbLink": imageUrl, "currentOwner": "", "timesCreated": images[3].timesCreated + 1 });
                    }
                    userData.NFBsCreated += 1;
                    userData.lastCreateCmd = -1;
                    USERS.update_nfb_user(userData);
                });
            });
        })
    },

    // --------------------------------------- \\
    //              Give function              \\
    //        Give borbcoins to a player       \\
    //       Perms: Admin and Flokclings       \\
    // --------------------------------------- \\
    async give(client, interaction) {
        const userID = interaction.options.get('user').value
        const targetUser = await client.users.fetch(userID)
        const amount = interaction.options.get('amount').value;

        USERS.get_nfb_user(targetUser, (userData) => {
            userData.CurrentBorbcoins += amount;
            userData.TotalBorbcoins += amount;


            USERS.update_nfb_user(userData);

            return interaction.editReply({ content: `Gave ${amount} borbcoins to ${targetUser.username}. New Balance: ${userData.CurrentBorbcoins}` });
        });
    },

    // --------------------------------------- \\
    //            Givepart function            \\
    //     Give a specific part to a player    \\
    //       Perms: Admin and Flokclings       \\
    // --------------------------------------- \\
    async givepart(client, interaction) {
        const partString = interaction.options.get('part').value
        const index = interaction.options.get('index').value
        const userID = interaction.options.get('user').value
        const targetUser = await client.users.fetch(userID)

        USERS.get_nfb_user(targetUser, (userData) => {
            const part = NFBHELPERFUNC.GetPart(partString, index)

            if (!part) return interaction.editReply(`Flokc have been lazy, we don't have ${index} different ${partString} :P`)
            replyMessage = interaction.editReply({
                content: `${targetUser.username} have been given ${part[1]}.`,
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
    },

    // --------------------------------------- \\
    //              Info function              \\
    //      Get info about player and nfb      \\
    // --------------------------------------- \\
    async info(client, interaction) {
        const userID = interaction.options.get('user') ? interaction.options.get('user').value : interaction.user.id;
        const targetUser = interaction.options.get('user') ? await client.users.fetch(userID) : interaction.user;

        USERS.get_nfb_user_with_nfb(targetUser, (userData) => {
                if (!userData.nfbID) return interaction.editReply({
                    content: `No info found!`
                });

                USERS.get_nfb_value(userData, (nfbValue) => {
                    var firstDate = new Date(userData.firstCreated);
                    var lastDate = new Date(userData.lastCreated);

                    var info = ``;
                    if (nfbValue) {
                        info += `**NFB value:** ${nfbValue}\n`
                    }
                    if (firstDate.getTime() == lastDate.getTime()) {
                        info += `**Created:** ${firstDate.toLocaleDateString("en-GB")} ${firstDate.toLocaleTimeString("en-US")}\n`
                    }
                    else {
                        info += `**First created:** ${firstDate.toLocaleDateString("en-GB")} ${firstDate.toLocaleTimeString("en-US")}\n` +
                            `**Last created:** ${lastDate.toLocaleDateString("en-GB")} ${lastDate.toLocaleTimeString("en-US")}\n`;
                    }

                    info += `**Times created:** ${userData.timesCreated}\n`

                    replyMessage = interaction.editReply({
                        content: userData.nfbLink
                    });
                    return interaction.channel.send(`**Current owner: **${targetUser.username}\n${info}`);
                });
        });
    },

    // --------------------------------------- \\
    //            Invest function              \\
    //   Invest borbcoins into your nfb parts  \\
    // --------------------------------------- \\
    async invest(client, interaction) {
        USERS.get_nfb_user_with_nfb(user, (userData) => {
            if (userData.nfbLink == "")
                return interaction.editReply(`You need a NFB before you start investing!`);
            if (userData.CurrentBorbcoins < INVEST_AMOUNT)
                return interaction.editReply({ content: `Not enough Borbcoins. You need **${INVEST_AMOUNT}** borbscoins to invest. **Current balance:** ${userData.CurrentBorbcoins}.`, ephemeral: false });

            userData.CurrentBorbcoins -= INVEST_AMOUNT;

            USERS.update_parts(userData, INVEST_AMOUNT);
            USERS.update_nfb_user(userData)
        });
    },

    // --------------------------------------- \\
    //              Merge function             \\
    //       Merge part into current nfb       \\
    // --------------------------------------- \\
    async merge(client, interaction) {
        var user = interaction.user;
        USERS.get_nfb_user_with_nfb(user, (userData) => {
            if (userData.nfbID == null)
                return interaction.editReply({ content: `You need to create a nfb first.` });

            if (userData.tempPart == null)
                return interaction.editReply({ content: `You need to buy a part first with /nfb buy` });

            const option = interaction.options.get('option').value

            if (option == "decline") {
                var tempPart = userData.tempPart.name;

                userData.tempPart = null;

                USERS.update_nfb_user(userData);

                // ---------------- \\
                // Update NFB PRIME \\
                // ---------------- \\
                return interaction.editReply(`You have declined **${tempPart}**!`)
            }

            // Get name of current NFB
            var oldNfbName = userData.nfbID;

            let parts = userData.parts

            // Replace part of NFB with temppart.
            parts[userData.tempPart.partType] = userData.tempPart.name;

            // Get info about nfb
            let images = NFBHELPERFUNC.GetPartsInfo(parts)

            // Create NFB based on new parts
            USERS.get_nfb({id: images[1]}, (newNfb) => {
                if (!newNfb) {
                    USERS.update_nfb_user(userData);
                    return interaction.editReply({ content: `This nfb already exist`, ephemeral: false });
                }
                NFBHELPERFUNC.CombineImages(images, async (tempFile) => {
                    var imageUrl = await NFBHELPERFUNC.SendImageAndGetImageLink(images[1], tempFile, interaction)
                    
                    userData.nfbID = images[1];
                    USERS.update_part_value(userData.tempPart.name, userData.tempPart.partType, NFB_PART_PRICE);
                    userData.tempPart = null;
                    USERS.update_nfb_user(userData);
                    USERS.update_nfbs({ "nfbID": images[1], "nfbLink": imageUrl, "currentOwner": user.id, "parts": parts }, { "nfbID": oldNfbName, "currentOwner": ""});
                    return interaction.channel.send({ content: `NFB part merged`, ephemeral: false });
                })
            });
        });
    },

    // --------------------------------------- \\
    //              Pet function               \\
    //   Pet nfb or nfb prime if nfb is null   \\
    // --------------------------------------- \\
    async pet(client, interaction) {
        user = interaction.user;
        USERS.get_nfb_user(user, (userData) => {
            let amount = NFBHELPERFUNC.getRndInteger(10, 25);
            let responseMessage;

            if (!userData.nfbLink) {
                amount = Math.floor(amount / 2);
                responseMessage = `You pet the NFB Prime since you don't have a NFB yet and got **${amount}** borbcoins.`
            }
            else {
                responseMessage = `You pet your NFB and got rewarded with **${amount}** borbcoins.`
            }

            userData.CurrentBorbcoins += amount;
            userData.TotalBorbcoins += amount;
            userData.NFBsPet += 1;

            USERS.update_nfb_user(userData);

            return interaction.editReply({ content: `${responseMessage}\n**New Balance:** ${userData.CurrentBorbcoins}` });
        });
    },

    // --------------------------------------- \\
    //             Remove function             \\
    //           Remove a players nfb          \\
    // --------------------------------------- \\
    async remove(client, interaction) {
        const userID = interaction.options.get('user').value
        const targetUser = await client.users.fetch(userID)

        USERS.get_nfb_user(targetUser, (userData) => {

            if (userData.nfbLink === "")
                return interaction.editReply({ content: `${targetUser.username} don't have an nfb.` });

            userData.nfbLink = "";
            userData.parts = null;

            USERS.update_nfb_user(userData);
            return interaction.editReply({ content: `${targetUser.username}'s nfb have been removed` });
        });
    },

    // --------------------------------------- \\
    //              Show function              \\
    //            Show a player nfb            \\
    // --------------------------------------- \\
    async show(client, interaction) {
        const userID = interaction.options.get('user') ? interaction.options.get('user').value : interaction.user.id;
        const targetUser = interaction.options.get('user') ? await client.users.fetch(userID) : interaction.user;
        USERS.get_nfb_user_with_nfb(targetUser, (target) => {
            if (target == false || !target.nfbLink) {
                return interaction.editReply(`${targetUser.username} don't have a NFB`);
            }
            else {
                return interaction.editReply(`${target.nfbLink}`);
            }
        });
    },
}