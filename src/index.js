const __globals = require('./globals.js');


const config = require('dotenv');
const { Client, GatewayIntentBits, Routes, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest')

const {registerCommands } = require('./utils/registry')

require('dotenv').config()
const { BOT_TOKEN, CLIENT_ID, GUILD_ID } = process.env;


const client = new Client({ intents: [GatewayIntentBits.Guilds], rest: {version: '10'} });

client.rest.setToken(BOT_TOKEN)

__globals.init();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
})

client.on('interactionCreate', (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.isChatInputCommand()) {
      const {commandName } = interaction;
      const cmd = client.slashCommands.get(commandName);
      if (cmd) {
        cmd.run(client, interaction);
      }
      else {
        interaction.reply('This command has no run method.')
      }
    }
});



async function main() {
  try {
    client.slashCommands = new Collection();
    await registerCommands(client, '../commands')

    const slashCommandsJson = client.slashCommands.map((cmd) => cmd.getSlashCommandJSON())

    await client.rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: slashCommandsJson,
  });

    // const registeredSlashCommands = await client.rest.get(
    //   Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
    // );
    // console.log(registeredSlashCommands)
    await client.login(BOT_TOKEN)
  } catch (err) {
    console.log(err);
  }
}

main();