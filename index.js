const fs = require('fs');
const Discord = require("discord.js");
const config = require("./config.json");
const JSONreader = require('./Utils/JSONreader.js');

//global variables
var gameCh = 'general'; //game channel
const prefix = config.prefix; //command prefix
var serverList = new Array();
var newServer = 
{
    name: "",
    channelID: "",
    started: false,
}

// Initialize Discord Bot
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
bot.login(config.token);

const commandFiles = fs.readdirSync('./Commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    //read through command files to save them into a list
    const command = require(`./Commands/${file}`);
	bot.commands.set(command.name, command);
}

bot.on('ready', (evt) => {OnBotIsReady(evt);});

bot.on('message',  message => {OnMessageRecived(message);});

bot.on('channelCreate', channel => { OnChannelCreated(channel);});

function OnBotIsReady(evt){
    var guilds = bot.guilds.cache.array();

    console.log("Connected");
    console.log(`Logged in as: ${bot.user.tag}`);
    console.log(`Logged in guilds: ${guilds}`);

    JSONreader.jsonReader('./servers.json', (err, servers) => {
        if (err) {
            console.log(err);
            return;
        }
        serverList = servers.servers;
        /** when bot is ready we check if the guild is in the server list, 
         * in case is not that way, we include into the list
         * it will be included just with the guild name/id and setted to not started yet
         */
        guilds.forEach(guild => {
        var serverToCheck = serverList.find(s => s.name == guild.id);
        if(!serverToCheck) //CREO
        {
            newServer.name = guild.id;
            newServer.channelID = "";
            newServer.started = false;
            serverList.push(newServer);
        }
       });
       //if server lists have different lengths we should save the new servers added to the list
       if(servers.servers.length <= serverList.length)
       {
        servers.servers = serverList;
        fs.writeFile('./servers.json', JSON.stringify(servers, null, 2), (err) => {
            if (err) console.log('Error writing file:', err);
        })
       }
    })

    console.log('All servers updated');
}

function OnMessageRecived(message) {
    // Bot will listen to commands starting with prefix '+'
    const content = message.content; //save de content in a variable for legible purposes
    if (!content.startsWith(prefix) || message.author.bot) return;
    if (content.startsWith(prefix)) {
        var server = serverList.find(name=>name.name == message.guild.id);
        if(!server) return;//TODO: server not encountered error
        //we get the arguments of the command
        const args = content.slice(prefix.length).trim().split(/ +/);
        const userCmdName = args.shift().toLowerCase();
        
        if(message.channel.id != server.channelID && server.started) {message.react('🚫'); return;}
        
        const command = bot.commands.get(userCmdName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(userCmdName)) || CheckFilteredCommand(userCmdName);
        if (!command) return;
        if (command.args && !args.length) {
            let reply = `You didn't provide any arguments, ${message.author}!`;
            if (command.usage) {
            	reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
            }
            return message.channel.send(reply);
    	}
        try {
            if(!server.started && command.name === 'setup')
            { 
                command.execute(message, args);
            }
            else if (command.name != 'setup')
            {
                if(!server.started){message.channel.send(`You need to set up the bot before start to use it.\n Use ${prefix}setup <channel name> to start playing.`).then().catch();}
                else if(command.name === 'setchannel'){
                    var channelChanged = command.execute(message, args);
                    if(channelChanged)
                        server.channelID = args[0];
                }else
                    command.execute(message, args, userCmdName);
            }else
            {
                message.delete();
                message.reply(`Set up is already done you can use ${prefix}setchannel <channel id> to change the channel where the bot will work on.`).then(msg => {msg.delete({timeout: 10000})}).catch();
            }
        } catch (error) {
            console.error(error);
            message.reply('there was an error trying to execute that command');
        }
    }
}

function OnChannelCreated(channel){
    //if the channel wasn't created by the bot we don't update the channelID
    if(channel.client.user.tag != bot.user.tag) return;
    JSONreader.jsonReader('./servers.json', (err, servers) => {
        if (err) {
            console.log(err)
            return
        }
        var server = serverList.find(name=>name.name == channel.guild.id);
        if(server != undefined && server.name == channel.guild.id && !server.started){
            serverList.find(name=>name.name == channel.guild.id).channelID = channel.id; 
            serverList.find(name=>name.name == channel.guild.id).started = true;
            servers.servers = serverList;
            fs.writeFile('./servers.json', JSON.stringify(servers, null, 2), (err) => {
                if (err) console.log('Error writing file:', err)
            })
        }
    })
}

// This methods checks if theres a coincidence of any combination between filters and aliases of a command
// if any command is found it will get returned
// otherwise if no combination is found undefinded will be returned
// it will also check any kind of combination
// if there's some combination that shouldn't be suitable, the command itself should warn about it
function CheckFilteredCommand(cmd){
    var cmdName = cmd[0];
    var cmdExtraName = cmd.substring(1);
    var isCorrectFilterCommand;
    // if comand has filters check if is a correct filter else it will return the undefined var isCorrectFilterCommand
    if(cmdExtraName.length > 0){
        var filters = cmdExtraName.split("");
        var i = 0;
        do{
            // check for combinations at least once
            isCorrectFilter = bot.commands.find(cmd => cmd.filters && cmd.filters.includes(filters[i]) && cmd.aliases && cmd.aliases.includes(cmdName));
            i++;
        }while(isCorrectFilter && i < cmdExtraName.length)    
    }
    //always return isCorrectFilterCommand
    return isCorrectFilterCommand;
}


