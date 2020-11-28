const quiz = require('../quiz.json');
var alreadyInUse = false;

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
            var numberOfQuestions = 0;
            message.channel.send('You went for a date with: ' + args.join(' '));
            //TODO: metodo recursivo de envío de mensajes que al llegar a la 5 llamada termine su ejecucion devolviendo un mensaje de finalizacion del mismo
            if(!alreadyInUse)
                SendQuestion();
            function SendQuestion(){
                numberOfQuestions++;
                alreadyInUse = true;
                if(numberOfQuestions == 5) return message.channel.send('All questions done');
                var item = quiz[Math.floor(Math.random() * quiz.length)];
                //TODO: preparar embed
            message.channel.send(`${message.author}: ` + item.question).then(() => {
                const filter = response => {
                    return response.author.id === message.author.id;
                }
                message.channel.awaitMessages(filter, { max: 1, time: 15000, errors: ['time'] })
                    .then(collected => {
                        if(item.answers.some(answer => answer.toLowerCase() === collected.first().toLowerCase()))
                            message.channel.send(`You got the correct answer!`);
                        else
                            message.channel.send(`You didn\'t get the correct answer.`);
                    })
                    .catch(collected => {
                        message.channel.send('You ran out of time.');
                    })
                    .finally(SendQuestion);
                }).finally(()=>{
                    alreadyInUse = false;
                });
            }
        }

    }
}