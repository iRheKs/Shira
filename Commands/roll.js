const { prefix, URI } = require('../config.json');
const mongoose = require('mongoose');
var schemaPlayer = new mongoose.Schema({tag: String, discordID: String, totalRolls: Number, currentRolls: Number, dateList: Array, wishList: Array}, {collection: 'Players', versionKey: false}) ;
var schemaCharacter = new mongoose.Schema({name: String, images: Array, series: String, gender: Number, type: String, }, {collection: 'Characters', versionKey: false}) ;
module.exports = 
{
    name: 'roll',
    shortDesc: 'Rolls some character',
    description: 'Rolls a character and depending on its aliases gives you a roll from one of this lists:\nMen, Women, Games, Anime, Random\nUsing <roll> will work as <random>',
    aliases: ['rolls','r','random','w','women','m','men'],
    filters: ['a','g'],
    usage: ` or ${prefix}<alias>`,
    execute(message, args, cmdAlias)
    {
        var embedID;
        const dbConnection = mongoose.createConnection(URI, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
        var  dbModelPlayer = dbConnection.model('Player', schemaPlayer);
        var  dbModelCharacter = dbConnection.model('Characters', schemaCharacter);
        dbConnection.on('error', console.error.bind(console, 'connection error:'));
        dbConnection.once('open', function() {
            dbModelPlayer.findOne({discordID : message.author.id}, function(err, player){
                if(err) throw err;

                //console.log('Doc: ' + player);

                if(player == null)
                {
                    player = { tag: message.author.tag, discordID: message.author.id, totalRolls: 15, currentRolls: 15};
                    player.currentRolls-=1;
                    dbModelPlayer.updateOne({discordID : message.author.id}, player, {upsert: true}, function(err, data){
                        if(err) throw err;
                    });
                }
                else
                {
                    player.currentRolls-=1;
                    player.save();
                }
                // message.channel.send('player: ' + player.tag);
                // message.channel.send('player total rolls: ' + player.totalRolls);
                // message.channel.send('player current rolls: ' + player.currentRolls);
                console.log('player: ' + player.tag + '\n' + 'player total rolls: ' + player.totalRolls + '\n' + 'player current rolls: ' + player.currentRolls);
                var character;
                dbModelCharacter.countDocuments({}, function (err, count){
                    if(err) throw err;
                    var random = Math.round(Math.random() * count);//TODO: no funciona correctamente de vez en cuando pilla un null revisar que le pasa
                    dbModelCharacter.findOne().skip(random).exec(function (err, result) {//TODO: esto debería de ir dentro del switch para poder meter el filtro correspondiente
                        // Tada! random user
                        character = result;
                        console.log(result);
                        // message.channel.send('alias sent was: ' + cmdAlias);
                        var cmdChar = cmdAlias[0];
                        switch (cmdChar) {
                            case 'r'://TODO: externalizar todo esto a un metodo para ser usado en los ditintos tipos de claim
                                message.channel.send({embed: {title: character.name, description: character.series, image: {"url" : character.images[0]}, footer: {text: "", icon_url:""}}}).then(embed => {
                                    embedID = embed.id;
                                    dbModelPlayer.exists({dateList: {$elemMatch: {name: character.name}}}).then(taken => {
                                        embed.react('❤️');
                                        if(taken)
                                            embed.react('⭐');// solo si alguien ya tiene dicha carta
                                        const claimFilter = (reaction, user) => {
                                            return reaction.emoji.name === '❤️' && !user.bot;
                                        };
                                        var userClaimTag;
                                        //TODO: awai reactions recursivo, como el de date. Condición de salida, el claim.
                                        embed.awaitReactions(claimFilter, { max: 1, time: 45000, errors: ['time']}).then(collected => {
                                            console.log(`Collected ${collected.size} reactions`)
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
                                            message.channel.messages.fetch(embedID).then(embedMessage => {
                                                var footer = embedMessage.footer != undefined ? { text: embedMessage.footer.text + `Claimed by ${user.username}`, icon_url: embedMessage.footer.icon_url} : { text: `Claimed by ${user.username}`, icon_url: user.avatarURL()};
                                                embedMessage.edit({embed: {title: character.name, description: character.series, image: {"url" : character.images[0]}, footer: footer}});
                                                message.channel.send(`**${user.username}**, **${character.name}** is now a part of your team.`);
                                            }).catch(err => {if (err) console.log(err); return;});
                                            dbModelPlayer.exists({discordID : user.id, dateList: {$elemMatch: {name: character.name}}}).then(playerTaken => {
                                                if (!playerTaken){
                                                    dbModelPlayer.updateOne({discordID : user.id}, {$push: {dateList: newDate}}, {upsert: true}, function(err, data){
                                                        if(err) throw err;
                                                    });
                                                    userClaimTag = user.tag;
                                                }
                                                else//TODO: si no lo tiene el player reset de await reaction y mensaje de que ya lo tiene
                                                    message.channel.send(`**${user.username}**, you already have **${character.name}**.`);
                                            });
                                            console.log(user.tag);
                                            return;
                                        }).catch(err => {if (err) console.log(err); return;});
                                        //reaccion que solo debe salir si esta carta ya la tiene alguien
                                        const reclaimFilter = (reaction, user) => {
                                            return reaction.emoji.name === '⭐' && !user.bot && user.tag != userClaimTag;
                                        };
                                        //TODO: await reactions recursivo, como el de date. Condición de salida, el take.
                                        embed.awaitReactions(reclaimFilter, { max: 1, time: 45000, errors: ['time']}).then(collected => {
                                            const reaction = collected.first();
                                            const user = reaction.users.cache.find(user => !user.bot);
                                            message.channel.messages.fetch(embedID).then(embedMessage => {
                                                var footer = embedMessage.footer ? { text: embedMessage.footer.text + `Taken by ${user.username}`, icon_url: embedMessage.footer.icon_url} : { text: `Taken by ${user.username}`, icon_url: user.avatarURL()};
                                                embedMessage.edit({embed: {title: character.name, description: character.series, image: {"url" : character.images[0]}, footer: footer}});
                                                message.channel.send(`**${user.username}**, you got a new card of **${character.name}**`);
                                            }).catch(err => {if (err) console.log(err); return;});
                                            console.log(user.tag);
                                            return;
                                        }).catch(err => {if (err) console.log(err); return;});
                                    }).catch(err => {if (err) console.log(err); return;});
                                }).catch(err => {if (err) console.log(err); return;});
                                break;
                            case 'w':
                                message.channel.send({embed: {title: 'Women character'}});
                                break;
                            case 'm':
                                message.channel.send({embed: {title: 'Men character'}});
                                break;
                            default:
                                break;
                        }
                    });
                });
            });        
        }).catch(err => {if (err) console.log(err); return;});
        
    }
}