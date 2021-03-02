const Discord = require("discord.js");
const quiz = require("../quiz.json");

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
        //TODO: Check if the character is "owned" by the player
        if (args.length > 0){
            //Crate the Embed message for the date
            const dateEmbed = {
                color: '#0000ff',
                title: 'Date with **' + args.join(' ') + '**',
                description: 'Answer the questions correctly for a reward!\nYou have 15s per question.',
                thumbnail: {"url":"https://media.tenor.com/images/f812668358cc20abe799b85ddcc58aa1/tenor.gif"},
                fields: {}
            };
            var numberOfQuestions = 0;
            var numberOfCorrectAnswers = 0;
            var embedID = '';
            var isFirst = true;
            SendQuestion();
            function SendQuestion(){
                numberOfQuestions++;
                if(numberOfQuestions == 5){ 
                    message.channel.messages.fetch(embedID).then(embedMessage => {
                        embedMessage.edit({embed: embedEnded(numberOfCorrectAnswers, args.join(' '))});
                    });//questions ended
                    return;
                }
                //get an item/question from the DB
            var item = quiz[Math.floor(Math.random() * quiz.length)];
            //build up the posible answers array
            var answers = [
                {
                    text: item.wrongAnswers[Math.floor(Math.random() * item.wrongAnswers.length)],//cambiar para que pille una respuesta sin repetir
                    emoji: '',
                    isCorrectAnswer: false,
                },{
                    text: item.wrongAnswers[Math.floor(Math.random() * item.wrongAnswers.length)],
                    emoji: '',
                    isCorrectAnswer: false,
                },{
                    text: item.wrongAnswers[Math.floor(Math.random() * item.wrongAnswers.length)],
                    emoji: '',
                    isCorrectAnswer: false,
                },{
                    text: item.answers[Math.floor(Math.random() * item.answers.length)],
                    emoji: '',
                    isCorrectAnswer: true,
                }
            ];
            //shuffle the answers array and set their correspondent reaction emojis
            shuffle(answers);
            answers[0].emoji = '1️⃣';
            answers[1].emoji = '2️⃣';
            answers[2].emoji = '3️⃣';
            answers[3].emoji = '4️⃣';
            //create the string for the embed message
            var listedAnswers = "";
            answers.forEach(answer => {
                listedAnswers += answer.emoji + ' ' + answer.text + '\n';
            });
            var field = { name: item.question, value: listedAnswers};
            dateEmbed.fields = [field];
            //Reaction into embedMessage
            if(isFirst){
                message.channel.send({embed: dateEmbed}).then(embedMessage => {
                    //To make reactions in order
                    embedID = embedMessage.id;
                    embedMessage.react('1️⃣');
                    embedMessage.react('2️⃣');
                    embedMessage.react('3️⃣');
                    embedMessage.react('4️⃣');
                    isFirst = false;
                    AwaitReaction(embedMessage,message,answers,SendQuestion);
                });
            }
            else{
                message.channel.messages.fetch(embedID).then(embedMessage => {
                    embedMessage.edit({embed: dateEmbed});
                    //embedMessage.reactions.removeAll();
                    AwaitReaction(embedMessage,message,answers,SendQuestion);
                });
            }

            }
            function AwaitReaction(embedMessage,message,answers,SendQuestion){
    
                 //Take the info of the reactions
                 const filter = (reaction, user) => {
                    return ['1️⃣', '2️⃣', '3️⃣', '4️⃣'].includes(reaction.emoji.name) && user.id === message.author.id;
                };
            
                embedMessage.awaitReactions(filter, { max: 1, time: 15000, errors: ['time'] })
                .then(collected => {
                    const reaction = collected.first();
                    //If u react to the correct answer, edit the embed and show next question
                    if(answers.find(answer => answer.isCorrectAnswer).emoji === reaction.emoji.name){
                        numberOfCorrectAnswers++;
                        //TODO: calculate relationship with player level
                    }
                    const reactionsToRemove = reaction.users.cache.filter(u => !u.bot);
                    for (const users of reactionsToRemove.values()) {
                        reaction.users.remove(users);
                    }
                    
                })
                .catch(collected => {
                }).finally(SendQuestion);
            }
        }
    }
}
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
}
function embedEnded(numberOfCorrectAnswers, dateName) {
    var finalComent = '';
    switch (numberOfCorrectAnswers) {
        case 0:
        case 1:
            finalComent += '**Nice try, good luck next time!**';
            break;
        case 2:
        case 3:
            finalComent += '**Good job!**';
            break;
        case 4:
            finalComent += '**Perfection!**';
            break;
    }
    var embedWin = { 
        color: '#00ff00',
        title: 'Your date with ' + dateName + ' has ended this way:',
        description: 'You got ' + numberOfCorrectAnswers + ' out of 4 posible answers.\n' + finalComent,
        thumbnail: {"url":"https://media.tenor.com/images/f812668358cc20abe799b85ddcc58aa1/tenor.gif"},
    };
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