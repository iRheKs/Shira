module.exports = 
{
    name: 'combat',
    shortDesc: 'Send your date to a combat',
    description: 'Sends one of your dates to combat in a random place against random enemies.\nFigth won\'t be seen.',
    aliases: ['c', 'battle', 'b'],
    args: true,
    usage: '<character name>',
    execute(message, args)
    {
        if (args.length > 0){
            message.channel.send('Your character' + args.join(' ') + ' Was send to combat against an enemy.');
        }
    }

}