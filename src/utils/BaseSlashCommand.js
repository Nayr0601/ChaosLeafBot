const { SlashCommandBuilder } = require('discord.js')

module.exports = class BaseSlashCommand {

    constructor(name, description) {
        this._name = name;
        this._description = description;
    }

    get name() {
        return this._name;
    }

    getSlashCommandJSON() {
        return new SlashCommandBuilder()
        .setName(this._name)
        .setDescription(this._description)
        .toJSON()
    }
}