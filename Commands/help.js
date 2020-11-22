const { prefix } = require('../config.json');
module.exports = 
{
    name: 'help',
    shortDesc: 'Command List',
    description: 'Shows up the command list',
    aliases: ['hlp'],
    usage: '<command name>',
    execute(message, args)
    {
        const data = new Array();
        const { commands } = message.client;
        const embed = 
        {
            color: 0x0099ff,
            title: 'Command List',
            fields: [],
        }
        if (!args.length) {
            var inlineCount = 4;
            var actualInline = 1;
            commands.forEach(command => {                
                data.push({name: command.name, value: command.shortDesc, inline: (actualInline%inlineCount) == 0});
                actualInline++;
            });
            data.push({name: '\u200b', value: `\nYou can use ${prefix}help ${this.usage} to get info on a specific command`, inline : false});
            embed.fields = data;
            return message.channel.send({embed: embed});
        }
        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.reply(' That\'s not a valid command');
        }
        embed.title = 'Command Name';
        data.push({name: command.name, value: '\u200b', inline: false});

        if (command.aliases) data.push({name: 'Aliases', value: command.aliases.join(', '), inline: true});
        if (command.description) data.push({name: 'Description', value: command.description, inline: true});
        if (command.usage) data.push({name: 'Usage', value: prefix + command.name + ' ' + command.usage, inline: true});
        if (command.cooldown) data.push({name: 'Cooldown time (seconds)', value: command.cooldown, inline: true});
        embed.fields = data;
        message.channel.send({embed: embed});
    }
}