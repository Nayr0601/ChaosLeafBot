const BaseSlashCommand = require('../utils/BaseSlashCommand')
const { SlashCommandBuilder } = require('discord.js');
const { createLeaderboardMessage } = require('../utils/messageAddons');

module.exports = class AddChaosLeavesCommand extends BaseSlashCommand {
    constructor() {
        super('chaosleaves', 'Chaos Leaves')
    }

    async run(client, interaction) {
        const subGroup = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();
        await interaction.deferReply({ ephemeral: true });
        
        if (subGroup === null) {
            
            if (subcommand === 'add') {
                const userID = interaction.options.get('user').value
                const user = await client.users.fetch(userID)
                const amount = interaction.options.get('amount').value;

                var sql = `SELECT * FROM Leaderboard WHERE ID = "${userID}"`;
                var userData;
                await DB.query(sql, function (err, result) {
                    if (err) {
                        console.log(error)
                        return interaction.editReply({ content: `An error occurred while connecting to the database`, ephemeral: true });
                    }
                    userData = result;
                    if (result.length == 0) {
                        var sql = `INSERT INTO Leaderboard (ID, name, total, current) VALUES ("${userID}", "${user.username}", ${amount}, ${amount})`;
                        DB.query(sql, function (err, result) {
                            if (err) {
                                console.log(error)
                                return interaction.editReply({ content: `An error occurred while connecting to the database`, ephemeral: true });
                            }
                            return interaction.editReply(`Added ${amount}<:chaos_leaf:1099496524800602163> to ${user}`);
                        });
                    }
                    else {
                        var sql = `UPDATE Leaderboard SET current = ${userData[0].current + amount}, total = ${userData[0].total + amount} WHERE ID = "${userID}"`;
                        DB.query(sql, function (err, result) {
                            if (err) {
                                console.log(error)
                                return interaction.editReply({ content: `An error occurred while connecting to the database`, ephemeral: true });
                            }
                        });
                    }
                });

                return interaction.editReply({ content: `Added ${amount}<:chaos_leaf:1099496524800602163> to ${user.username}`});
            }

            else if (subcommand === 'remove') {
                const userID = interaction.options.get('user').value
                const user = await client.users.fetch(userID)
                const amount = interaction.options.get('amount').value;

                var sql = `SELECT * FROM Leaderboard WHERE ID = "${userID}"`;
                var userData;
                DB.query(sql, function (err, result) {
                    if (err) {
                        console.log(error)
                        return interaction.editReply({ content: `An error occurred while connecting to the database`, ephemeral: true });
                    }
                    userData = result;
                    if (result.length == 0) {
                        return interaction.editReply(`${user.username} doesn't exitst on the leaderboard`);
                    }
                    else {
                        var sql = `UPDATE Leaderboard SET current = ${userData[0].current - amount} WHERE ID = "${userID}"`;
                        DB.query(sql, function (err, result) {
                            if (err) {
                                console.log(error)
                                return interaction.editReply({ content: `An error occurred while connecting to the database`, ephemeral: true });
                            }
                        });
                    }
                });
                return interaction.editReply(`Removed ${interaction.options.get('amount').value}<:chaos_leaf:1099496524800602163> from ${user.username}`);
            }

            else if (subcommand === 'leaderboard') {
                var sql = `SELECT name, current FROM Leaderboard ORDER BY current DESC`;
                var messageChunks;
                await DB.query(sql, function (err, result) {
                    if (err) {
                        console.log(error)
                        return interaction.editReply({ content: `An error occurred while connecting to the database`, ephemeral: true });
                    }

                    messageChunks = createLeaderboardMessage(result, 2000);
                    for (let chunk of messageChunks) {
                        interaction.channel.send(chunk)
                    }
                    return interaction.editReply({ content: `Leaderboard message created!`, ephemeral: true });
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
                    .setName('add')
                    .setDescription('Add Chaos Leaves to player')
                    .addUserOption((option) =>
                        option.setName('user')
                            .setDescription('The user to give Chaos Leaves')
                            .setRequired(true)
                    )
                    .addIntegerOption((option) =>
                        option
                            .setName('amount')
                            .setDescription('How many Chaos Leaves should the person get')
                            .setRequired(true)
                            .setMinValue(1)
                    )
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('remove')
                    .setDescription('Removes Chaos Leaves to player')
                    .addUserOption((option) =>
                        option.setName('user')
                            .setDescription('The user to give Chaos Leaves')
                            .setRequired(true)
                    )
                    .addIntegerOption((option) =>
                        option
                            .setName('amount')
                            .setDescription('How many Chaos Leaves should the person get')
                            .setRequired(true)
                            .setMinValue(1)
                    )
            )
            .addSubcommand((subcommand) =>
                subcommand.setName('leaderboard').setDescription('Show Leaderboard')
            )
            .toJSON()
    }
}