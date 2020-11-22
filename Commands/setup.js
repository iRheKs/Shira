module.exports = 
{
    name: 'setup',
    shortDesc: 'Sets up the bot',
    description: 'Create Channel for the Bot and sets it as main channel only',
    aliases: ['su'],
    args: true,
    usage: '<channel name>',
    execute(message, args)
    {
        if (args.length > 0){
            message.delete({timeout: 5000});
            return message.guild.channels.create(args.join('-'), "text",{ reason: 'Channel for the Bot' });
        }
    }
}