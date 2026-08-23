const BaseSlashCommand = require('../utils/BaseSlashCommand')
const { SlashCommandBuilder } = require('discord.js');

const fs = require('fs');
const Jimp = require('jimp').Jimp;

module.exports = class AddChaosLeavesCommand extends BaseSlashCommand {
    constructor() {
        super('nfb2', 'NFB2 commands')
    }

    async run(client, interaction) {
        const subGroup = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();

        const userID = interaction.user.id;
        const user = interaction.user;

        let replyMessage = await interaction.deferReply();

        if (subGroup === null) {

            if (subcommand === 'show') {
                const image = await Jimp.read("./src/Bits/Backgrounds/1 Blue Cornflower.png");
                image.resize({width: image.height * 2})
                image.write('./src/Test.png')
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
    }
}