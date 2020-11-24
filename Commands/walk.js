module.exports = 
{
    name: 'walk',
    shortDesc: 'Send a character for a walk',
    description: 'Send\'s one of your characters for a walk with the character of a desired user in the server.',
    args: true,
    usage: '<character number> <user mention> <user\'s character number>',
    execute(message, args)
    {
        if (args.length == 3){
            message.channel.send('You send '+ args[0] +' for a walk with: ' + args[2] + ' from: ' + args[1]);
        }else if (args.length > 3){
            message.channel.send('Too much arguments, try using the arguments as shown: ' + this.usage);
        }else{
            message.channel.send('Not enought arguments, try using the arguments as shown: ' + this.usage);
        }
    }
}