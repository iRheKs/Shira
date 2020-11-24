const { prefix } = require('../config.json');
module.exports = 
{
    name: 'roll',
    shortDesc: 'Rolls some character',
    description: 'Rolls a character and depending on its aliases gives you a roll from one of this lists:\nMen, Women, Games, Anime, Random\nUsing <roll> will work as <random>',
    aliases: ['rolls','r','random','w','women','m','men','a','anime','g','games'],
    usage: ` or ${prefix}<alias>`,
    execute(message, args, cmdAlias)
    {
        message.channel.send('alias sent was: ' + cmdAlias);
        switch (cmdAlias) {
            case 'roll':
            case 'rolls':
            case 'r':
            case 'random':
                message.channel.send({embed: {title: 'Random character'}});
                break;
            case 'women':
            case 'w':
                message.channel.send({embed: {title: 'Women character'}});
                break;
            case 'men':
            case 'm':
                message.channel.send({embed: {title: 'Men character'}});
                break;
            case 'anime':
            case 'a':
                message.channel.send({embed: {title: 'Anime character'}});
                break;
            case 'games':
            case 'g':
                message.channel.send({embed: {title: 'Games character'}});
                break;
        
            default:
                break;
        }
    }
}