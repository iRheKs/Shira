const Discord = require("discord.js");
const { prefix } = require('../config.json');

module.exports = 
{
    name: 'information',
    shortDesc: 'Bot Information',
    description: 'Shows the information about the bot and its status',
    aliases: ['i','info'],
    execute(message, args)
    {
        const verEmbed = new Discord.MessageEmbed()
        .setColor('#00ffff')
        .setTitle('📢 Info')
        .setAuthor('Created by: Cookie & iRheKs')
        .setThumbnail('https://imgur.com/4Q5rHfi.png')
        .addFields(
        { name: 'Versions', value: '- V1.0   Release'},
        { name: 'Config', value:   '**Channel: **' + message.channel.name},
        { name: 'Command Help', value: `Type ${prefix}help for commands information`},
        ).setFooter('This bot works at every time. Last patch 11-21-2020.');
        message.channel.send(verEmbed);
    }
}