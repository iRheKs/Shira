const Discord = require("discord.js");

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
            //Embed date
            const dateEmbed = new Discord.MessageEmbed()
            .setColor(rgbRandom())
            .setTitle('Date with **' + args.join(' ') + '**')
            .setDescription('Answer the question correctly for a reward!\nYou have 10s')
            .setThumbnail('https://media.tenor.com/images/f812668358cc20abe799b85ddcc58aa1/tenor.gif')
            .addFields(
            { name: 'Which race ' + args.join(' ') + ' belongs to?', value: '1️⃣ Imanity\n2️⃣ Elf\n3️⃣ Werebeast\n4️⃣ Fairy'},
            )

            //Reaction into embedMessage
            message.channel.send(dateEmbed).then(embedMessage => {
                //To make reactions in order
                embedMessage.react("1️⃣")
                .then(() => embedMessage.react('2️⃣'))
                .then(() => embedMessage.react('3️⃣'))
                .then(() => embedMessage.react('4️⃣'))

                //Take the info of the reactions
                const filter = (reaction, user) => {
                    return ['1️⃣', '2️⃣', '3️⃣', '4️⃣'].includes(reaction.emoji.name) && user.id === message.author.id;
                };
    
                embedMessage.awaitReactions(filter, { max: 1, time: 15000, errors: ['time'] })
                .then(collected => {
                    const reaction = collected.first();
    
                    //If u react to the correct answer, edit the embed and show correct
                    switch (reaction.emoji.name) {
                        case '1️⃣':    
                            //Create the new embed and edit
                            embedMessage.edit(embedWin())
                            break;
                        case '2️⃣':
                            embedMessage.edit(embedFail('2️⃣'))
                            break;
                        case '3️⃣':
                            embedMessage.edit(embedFail('3️⃣'))
                            break;
                        case '4️⃣':
                            embedMessage.edit(embedFail('4️⃣'))
                            break;
                    }
                })
                //If there is no reply
                .catch(collected => {
                    embedMessage.edit(embedTimeUp())
                });
            });
        }
    }    
}

function rgbRandom() {
    return '#0000ff'
}

function embedWin() {
    let embedWin = new Discord.MessageEmbed()
    .setDescription('Correct!')
    .setColor("#00ff00")
    return embedWin;
}

function embedFail(option) {
    let embedFail = new Discord.MessageEmbed()
    .setDescription('Fail! You choose ' + option)
    .setColor("#ff0000")
    return embedFail;
}

function embedTimeUp(){
    let embedTimeUp = new Discord.MessageEmbed()
    .setDescription('Time\'s up!')
    .setColor("#000000")
    return embedTimeUp;
}