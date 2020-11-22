const JSONreader = require('../Utils/JSONreader.js');
const fs = require('fs');

module.exports = 
{
    name: 'setchannel',
    shortDesc: 'Change the channel',
    description: 'Changes the Channel for the Bot and sets it as only channel. \n **NOTE**: If channel is not found it won\'t update the info, also bot must be started before use this command.',
    aliases: ['sc', 'newchannel', 'changechannel', 'cc'],
    args: true,
    usage: '<channel id>',
    execute(message, args)
    {
        if (args.length > 0){
            message.delete();
            var channel = message.guild.channels.cache.get(args[0]);
            if(channel){
                JSONreader.jsonReader('./servers.json', (err, servers) => {
                    if (err) {
                        console.log(err);
                        return false;
                    }
                    var server = servers.servers.find(name=>name.name == message.guild.id);
                    if(server && server.name == message.guild.id && server.started){
                        servers.servers.find(name=>name.name == message.guild.id).channelID = args[0]; 
                        fs.writeFile('./servers.json', JSON.stringify(servers, null, 2), (err) => {
                            if (err) {console.log('Error writing file:', err); return false;}
                        })
                    }
                })
                message.reply('Bot channel changed to channel with ID: ' + args[0]).then(msg => {msg.delete({ timeout: 5000 });}).catch();
            }else{
                message.reply('Channel could not be found with that ID');
                return false;
            }
            return true;
        }
        return false;
    }
}