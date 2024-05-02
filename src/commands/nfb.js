const BaseSlashCommand = require('../utils/BaseSlashCommand')
const { SlashCommandBuilder } = require('discord.js');
const { CreateRandomNFB, getRndInteger, GetPartsInfo, GetRandomPart, GetPart, CombineImages, SendImageAndGetImageLink } = require('../utils/nfbFunctions');


module.exports = class AddChaosLeavesCommand extends BaseSlashCommand {
    constructor() {
        super('nfb', 'NFB commands')
    }

    async run(client, interaction) {
        const subGroup = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();

        const userID = interaction.user.id;
        const user = interaction.user;

        let replyMessage = await interaction.deferReply({ ephemeral: false });

        if (subGroup === null) {

            if (subcommand === 'show') {
                return NFBCMDFUNC.show(client, interaction);
            }

            else if (subcommand === 'bal') {
                return NFBCMDFUNC.bal(client, interaction);
            }


            else if (subcommand === 'pet') {
                return NFBCMDFUNC.pet(client, interaction);
            }


            else if (subcommand === 'create') {
                NFBCMDFUNC.create(client, interaction);
            }

            else if (subcommand === 'remove') {
                NFBCMDFUNC.remove(client, interaction)
            }

            else if (subcommand === 'give') {
                NFBCMDFUNC.give(client, interaction);
            }

            else if (subcommand === 'givepart') {
                NFBCMDFUNC.givepart(client, interaction);
            }

            else if (subcommand === 'buy') {
                NFBCMDFUNC.buy(client, interaction);
            }

            else if (subcommand === 'invest') {
                NFBCMDFUNC.invest(client, interaction);
            }

            else if (subcommand === 'info') {
                NFBCMDFUNC.info(client, interaction);
            }
            else if (subcommand === 'merge') {
                NFBCMDFUNC.merge(client, interaction);
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
                    .setName('bal')
                    .setDescription('Show Players balance')
                    .addUserOption((option) =>
                        option.setName('user')
                            .setDescription('Users BC balance you want to see')
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
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('invest')
                    .setDescription('Invest borbcoins into your nfb.')
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('merge')
                    .setDescription('Replace a part of your nfb with another')
                    .addStringOption((option) =>
                        option.setName('option')
                            .setDescription('NFB Part picker')
                            .setRequired(true)
                            .addChoices(
                                { name: 'Accept', value: 'accept' },
                                { name: 'Decline', value: 'decline' },
                            )
                    )
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
                            .setMinValue(1)
                    )
            ).addSubcommand((subcommand) =>
                subcommand
                    .setName('givepart')
                    .setDescription('Give player a specific')
                    .addUserOption((option) =>
                        option.setName('user')
                            .setDescription('User to give Borbcoins')
                            .setRequired(true)
                    )
                    .addStringOption((option) =>
                        option.setName('part')
                            .setDescription('NFB Part picker')
                            .setRequired(true)
                            .addChoices(
                                { name: 'Borb', value: 'Borbs' },
                                { name: 'Background', value: 'Backgrounds' },
                                { name: 'Frame', value: 'Frames' },
                                { name: 'Item', value: 'Items' },
                            )
                    )
                    .addIntegerOption((option) =>
                        option
                            .setName('index')
                            .setDescription('Borbcoins to give')
                            .setRequired(true)
                            .setMinValue(0)
                    )
            )
    }
}