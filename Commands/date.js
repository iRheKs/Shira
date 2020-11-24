module.exports = 
{
    name: 'date',
    shortDesc: 'Go to a date with a character',
    description: 'Sends you to a date with one of your characters.\nYour answers to the questions will determine how good was the date.\nThe difficulty will be determined by the level of the character you are going out with',
    aliases: ['d'],
    args: true,
    usage: '<character name>',
    execute(message, args)
    {
        if (args.length > 0){
            message.channel.send('You went for a date with: ' + args.join(' '));
        }
    }
}