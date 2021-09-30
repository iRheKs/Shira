const { prefix, URI } = require('../config.json');
const mongoose = require('mongoose');
var schemaPlayer = new mongoose.Schema({tag: String, discordID: String, totalRolls: Number, currentRolls: Number, dateList: Array, wishList: Array}, {collection: 'Players', versionKey: false}) ;
var schemaCharacter = new mongoose.Schema({name: String, images: Array, series: String, gender: String, type: String, }, {collection: 'Characters', versionKey: false}) ;
module.exports = 
{
    name: 'roll',
    shortDesc: 'Rolls some character',
    description: 'Rolls a character and depending on its aliases gives you a roll from one of this lists:\nMen, Women, Games, Anime, Random\nUsing <roll> will work as <random>\nFilters will only work if used with short comand forms. (r, w or m)',
    aliases: ['rolls','r','random','w','women','m','men'],
    filters: ['a','g','c'],
    usage: ` or ${prefix}<alias>`,
    execute(message, args, cmdAlias)
    {
        var embedID = '';
        var userClaimTag = "";
        //create db connection
        const dbConnection = mongoose.createConnection(URI, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
        //create db models
        const  dbModelPlayer = dbConnection.model('Player', schemaPlayer);
        const  dbModelCharacter = dbConnection.model('Characters', schemaCharacter);
        //if connection fails
        dbConnection.on('error', console.error.bind(console, 'connection error:'));
        //on opened connection
        dbConnection.once('open', function() {
            var canRoll = false;
            //find player
            dbModelPlayer.findOne({discordID : message.author.id}, function(err, player){
                if(err) throw err;
                //console.log('Doc: ' + player);
                //if player null create a new player in db
                if(player == null)
                {
                    player = { tag: message.author.tag, discordID: message.author.id, totalRolls: 15, currentRolls: 15};
                    player.currentRolls-=1;
                    dbModelPlayer.updateOne({discordID : message.author.id}, player, {upsert: true}, function(err, data){
                        if(err) throw err;
                    });
                }
                else //else update number of current rolls
                {
                    player.currentRolls-=1;
                    player.save();
                }
                
                console.log('player: ' + player.tag + '\n' + 'player total rolls: ' + player.totalRolls + '\n' + 'player current rolls: ' + player.currentRolls);
                //check current rolls is 1+
                if(player.currentRolls > 0)
                    canRoll = true; //roll method

                console.log('Can player roll? ' + canRoll);

                // cmdChar indicates which filter to use when looking for characters in db, no switch case needed
                var cmdChar = cmdAlias[0];
                // categoryFilter will only work if comand is in short form: r, w or m
                var categoryFilter = '$'; // default value is $ to include all posibilities
                // only one filter with a short alias is allowed in the this command
                // so then if cmdAlias is 2 we take the filter out otherwise, a message is returned and command finished
                if(cmdAlias.length == 2){
                    categoryFilter = cmdAlias[1];
                }
                else{
                    message.channel.send(`Only one filter with short aliases is allowed on roll comand`);
                    return;
                }

                //roll filter will have always the filter of cmdChar and categoryFilter will add a category filter
                //if no category filter added, default value will act as an regular expression evaluated with $regex mongoDB filter
                const rollFilter = {$and: [{rollFilters: {$elemMatch: { $eq: cmdChar}}}, {rollFilters: {$elemMatch: { $regex: categoryFilter}}}]};

                dbModelCharacter.countDocuments(rollFilter, function (err, count){
                    if(err) throw err;
                    var random = Math.round((Math.random() * (count - 1)));//get a random number to skip that number of documents
                    console.log('Random document number to skip: ' + random);
                    
                    if(count > 0)
                        Roll(random, rollFilter);
                    else
                        message.channel.send(`There is no character in that scope yet. Hope some will come soon`);
                });
            });       
        }).catch(err => {if (err) console.log(err); return;});
        
        function Roll(random, rollFilter){
            dbModelCharacter.findOne(rollFilter).skip(random).exec(function (err, result) {
                // the result will be the next document number to the random number e.g. random=1 -> document=2
                // in this case the result will be the character
                var character = result;
                console.log(result);
                // sends the message and then reacts to it and awaits for reactions
                message.channel.send({embed: {title: character.name, description: character.series, image: {"url" : character.images[0]}, footer: {text: "", icon_url:""}}}).then(embed => 
                    {
                    embedID = embed.id;
                    dbModelPlayer.exists({dateList: {$elemMatch: {name: character.name}}}).then(taken => {
                        embed.react('❤️');
                        if(taken)
                            embed.react('⭐');// only react with ⭐ if someone has already the character
                        
                        // await for Claim reaction recursively
                        AwaitClaimReaction(embed, embedID);
                        
                        // await for Taken reaction recursively
                        AwaitTakenReaction(embed, embedID);
                        
                    }).catch(err => {if (err) console.log(err); return;});
                }).catch(err => {if (err) console.log(err); return;});
            });
        }

        function AwaitClaimReaction(embed, embedID){
    
            // Filter for the claim reaction, just check that user is not the bot
            const claimFilter = (reaction, user) => {
                return reaction.emoji.name === '❤️' && !user.bot;
            };
            
            embed.awaitReactions(claimFilter, { max: 1, time: 45000, errors: ['time']}).then(collected => {
                //console.log(`Collected ${collected.size} reactions`)
                const reaction = collected.first();
                const user = reaction.users.cache.find(user => !user.bot);
                var newDate = 
                {
                    name: character.name,
                    level: 1,
                    totalExperience: 0,
                    rarityLevel: 1,
                    rarity: "Common",
                    claimedCards: 1,
                    color: "#000000",
                    dateNumber: 0
                };
                //check if player that claimed has the character
                dbModelPlayer.exists({discordID : user.id, dateList: {$elemMatch: {name: character.name}}}).then(playerTaken => {
                    if (!playerTaken){
                        message.channel.messages.fetch(embedID).then(embedMessage => {
                            var footer = embedMessage.footer != undefined ? { text: embedMessage.footer.text + `Claimed by ${user.username}`, icon_url: embedMessage.footer.icon_url} : { text: `Claimed by ${user.username}`, icon_url: user.avatarURL()};
                            embedMessage.edit({embed: {title: character.name, description: character.series, image: {"url" : character.images[0]}, footer: footer}});
                            message.channel.send(`**${user.username}**, **${character.name}** is now a part of your team.`);
                        }).catch(err => {if (err) console.log(err); return;});
                
                        dbModelPlayer.updateOne({discordID : user.id}, {$push: {dateList: newDate}}, {upsert: true}, function(err, data){
                            if(err) throw err;
                        });
                        userClaimTag = user.tag;
                    }
                    else{
                        message.channel.send(`**${user.username}**, you already have **${character.name}**.`);
                        AwaitClaimReaction(embed, embedID);
                    }
                });
                console.log(user.tag + ' Claim');
                return;
            }).catch(err => {if (err) console.log(err); return;});
        }

        function AwaitTakenReaction(embed, embedID){
            // Filter for the taken reaction, check that user is not the bot and only the user that had it before the roll can take a new card of the character
            const reclaimFilter = (reaction, user) => {
                return reaction.emoji.name === '⭐' && !user.bot && user.tag != userClaimTag;
            };
            //TODO: terminar de definir cuantos takes hay y demas para poder terminar ese await
            embed.awaitReactions(reclaimFilter, { max: 1, time: 45000, errors: ['time']}).then(collected => {
                const reaction = collected.first();
                const user = reaction.users.cache.find(user => !user.bot);
                dbModelPlayer.exists({discordID : user.id, dateList: {$elemMatch: {name: character.name}}}).then(playerTaken => {
                    if(playerTaken){
                        message.channel.messages.fetch(embedID).then(embedMessage => {
                            var footer = embedMessage.footer ? { text: embedMessage.footer.text + `Taken by ${user.username}`, icon_url: embedMessage.footer.icon_url} : { text: `Taken by ${user.username}`, icon_url: user.avatarURL()};
                            embedMessage.edit({embed: {title: character.name, description: character.series, image: {"url" : character.images[0]}, footer: footer}});
                            message.channel.send(`**${user.username}**, you got a new card of **${character.name}**`);
                        }).catch(err => {if (err) console.log(err); return;});
                    }
                    else{
                        message.channel.send(`**${user.username}**, you don't have **${character.name}** yet. Claim it first.`);
                        AwaitTakenReaction(embed, embedID);
                    }
                });
                console.log(user.tag + ' Taken');
                return;
            }).catch(err => {if (err) console.log(err); return;});
        }
    }//execute end
}