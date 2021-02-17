const Discord = require('discord.js');
const fs = require('fs');
const bot = new Discord.Client;
const token = require('./token');
const bdd = require("./bdd.json");
var prefix = "**"
bot.on("ready", async () => {
    bot.user.setStatus("dnd")
})
bot.on("message", message => {
    if (message.content.startsWith(`${prefix}help`)) {
        const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#EF2917')
            .setTitle('Help')
            .setAuthor('N-kOo')
            .setDescription('**__les commandes :__**\n (<> = obligatoire,  {} = facultatif)')
            .addFields(
                { name: '**locadd** <position name> <position X> <position y> <position z>', value: 'ajouter une position' },
                { name: '**locremove** <position name>', value: 'retirer une position', },
                { name: '**locate** {position name}', value: 'consulter ses positions', },
            )
            .addField('préfix', '**', true)


        message.channel.send(exampleEmbed);
    }
    if (message.content.startsWith(`${prefix}locadd`)) {
        let args = message.content.trim().split(/ +/g);

        if (args[4]) {
            let utilisateur = message.author.id;

            if (isNaN(args[1])) {
                let x = args[2];
                let y = args[3];
                let z = args[4];
                let positionname = args[1];
                if (bdd[utilisateur]) {
                    bdd[utilisateur][positionname] = { x, y, z }
                    Savebdd()
                    message.channel.send(`${positionname} à été enregistré aux coordonées x : ${bdd[utilisateur][positionname].x} y : ${bdd[utilisateur][positionname].y} z :${bdd[utilisateur][positionname].z} !!`)
                }
                else {
                    bdd[utilisateur] = {}
                    Savebdd()
                    setTimeout(() =>{
                        bdd[utilisateur][positionname] = { x, y, z }
                        Savebdd()
                        message.channel.send(`${positionname} à été enregistré aux coordonées x : ${bdd[utilisateur][positionname].x} y : ${bdd[utilisateur][positionname].y} z :${bdd[utilisateur][positionname].z} !!`)
                    }, 100)

                }


            }
            else {
                console.log("erreur (pas assez d'args)")
                message.reply("ERREUR DE SYNTAXE")
            }
        }
    }
    if (message.content.startsWith(`${prefix}locate`)){
        
    }
    
})
function Savebdd() {
    fs.writeFile("./bdd.json", JSON.stringify(bdd, null, 4), (err) => {
        if (err) message.channel.send("Une erreure est survenue");
    })
}
bot.login(token.token);