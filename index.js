const Discord = require('discord.js');

const auth = require('./auth');

const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.login(auth.token).catch(console.error);