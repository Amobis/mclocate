const Discord = require('discord.js');
const fs = require('fs');
const bot = new Discord.Client;
const token = require('./token');
const bdd = require("./bdd.json");
const { measureMemory } = require('vm');
const bot2 = new Discord.Client;
bot.on("ready", async () => {
    bot.user.setStatus("dnd")
    if (!bdd["users"]) {
        bdd["users"] = {}
        Savebdd()
    }
    if (!bdd["guild"]) {
        bdd["guild"] = {}
        Savebdd()
    }
})
bot.on("guildCreate", guild => {
    bdd["guild"][guild.id] = {}
    Savebdd()
})
//===================================================================================================================
bot.on("message", message => {
    //set l'id du serveur dans bdd["guild"]
    if (!bdd["guild"][message.guild.id]) {
        bdd["guild"][message.guild.id] = {}
        Savebdd()
    }
    //tester et récupérer prefix
    let prefix = ""
    if (bdd["guild"][message.guild.id]["prefix"]) {
        prefix = bdd["guild"][message.guild.id]["prefix"]
    }
    else {
        prefix = "-"
    }
    //========================================================================================================================
    //setprefix
    if (message.content.startsWith(`${prefix}setprefix`)) {
        let args = message.content.trim().split(/ +/g)
        if (message.member.hasPermission("MANAGE_CHANNELS")) {
            if (args.length === 2) {
                if (bdd["guild"][message.guild.id] && args[1] != "defaut") {
                    bdd["guild"][message.guild.id] = { "prefix": args[1] }
                    Savebdd()
                    message.channel.send("préfix du bot défini à : " + bdd["guild"][message.guild.id]["prefix"])
                }
                if (bdd["guild"][message.guild.id] && args[1] === "defaut") {
                    bdd["guild"][message.guild.id] = { "prefix": "-" }
                    Savebdd()
                    message.channel.send(`le préfix à été réinitialisé (**-**)`)
                }
                if (!bdd["guild"][message.guild.id]) {
                    message.channel.send(`ERREUR : guild.id inconue`)
                    bdd["guild"][message.guild.id] = {}
                    Savebdd()
                }

            }
            else{
                message.channel.send("ERREUR de Syntaxe : consultez **"+ prefix+"help**.")
            }
        }
        else{
            message.channel.send("⛔ Tu n'a pas la permission de changer le prefix ⛔")
        }
    }
    //===================================================================================================================
    //help
    if (message.content.startsWith(prefix + "help")) {

        const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#EF2917')
            .setTitle('Help')
            .setAuthor('N-kOo')
            .setDescription('**__les commandes :__**\n (<> = obligatoire,  {} = facultatif)')
            .addFields(
                { name: '**locadd** <position name> <position X> <position y> <position z>', value: 'ajouter une position' },
                { name: '**locremove** <position name> ou <//all>', value: 'retirer une position (ou toutes)', },
                { name: '**locate** {position name}', value: 'consulter ses positions', },
                { name: '**setprefix** <new prefix> ou <defaut>', value: 'définir un nouveau préfix (prefix par défaut : - )', },
            )
            .addField('préfix', prefix, true)
        setTimeout(() => {
            message.channel.send(exampleEmbed);
        }, 100)



    }
    //===================================================================================================================
    //locadd
    if (message.content.startsWith(`${prefix}locadd`)) {
        let args = message.content.trim().split(/ +/g);
        let utilisateurID = message.author.id;
        if (args[4] && !args[5]) {
            //====================================================================================================================
            //Definition coordonées
            let posX = args[2];
            let posY = args[3];
            let posZ = args[4];
            //====================================================================================================================
            if (isNaN(args[1]) && args[1] != "//all") {
                let name = args[1];
                let obj = {
                    "name": name,
                    "pos": [
                        posX,
                        posY,
                        posZ,
                    ]
                }
                if (bdd["users"][utilisateurID]) {
                    if (bdd.users[utilisateurID][0]) {
                        for (let i = 0; i < bdd.users[utilisateurID].length; i++) {
                            if (bdd["users"][utilisateurID][i]["name"] === name) {
                                bdd.users[utilisateurID][i]["pos"] = [posX, posY, posZ]
                                Savebdd()
                                message.channel.send(`La coordonnée **${name}** a été mise à jour en x : **${posX}**, y : **${posY}**, z : **${posZ}**.`)
                                return
                            }
                            if (i + 1 === bdd.users[utilisateurID].length) {
                                bdd["users"][utilisateurID].push(obj)
                                Savebdd()
                                message.channel.send(`La coordonnée **${name}** a été enregisté en x : **${posX}**, y : **${posY}**, z : **${posZ}**.`)
                                return
                            }

                        }

                    }
                    else {
                        bdd["users"][utilisateurID].push(obj)
                        Savebdd()
                        message.channel.send(`La coordonnée **${name}** a été enregisté en x : **${posX}**, y : **${posY}**, z : **${posZ}**.`)
                        Savebdd()
                    }

                }
                else {
                    bdd["users"][utilisateurID] = []
                    Savebdd()
                    bdd["users"][utilisateurID].push(obj)
                    console.log(bdd["users"][utilisateurID][0]["name"])
                    Savebdd()
                    message.channel.send(`La coordonnée **${name}** a été enregisté en x : **${posX}**, y : **${posY}**, z : **${posZ}**.`)
                }
            }
            if (args[1] === "//all") {
                message.channel.send("//all ne peut pas être un nom de coordonée {réservé}")
            }
            if (!isNaN(args[1])) {
                message.channel.send("Le nom doit etre une chaine de caractère, pas un nombre seul.")
            }
        }
        else {
            message.channel.send("Syntaxe invalide : consultez help.")
        }
    }
    //=======================================================================================================================
    if (message.content.startsWith(`${prefix}locate`)) {
        let args = message.content.trim().split(/ +/g);
        let utilisateurID = message.author.id
        if (bdd["users"][utilisateurID]) {
            if (bdd["users"][utilisateurID][0]) {
                if (args[1] && !args[2]) {
                    let name = args[1]

                    for (i = 0; i < bdd["users"][utilisateurID].length; i++) {
                        if (bdd["users"][utilisateurID][i]["name"] === name) {
                            message.channel.send(`La coordonnée **${bdd["users"][utilisateurID][i]["name"]}** est définie sur x : **${bdd["users"][utilisateurID][i]["pos"][0]}**, y : **${bdd["users"][utilisateurID][i]["pos"][1]}**, z : **${bdd["users"][utilisateurID][i]["pos"][2]}**.`)
                            return
                        }
                        if (i + 1 === bdd["users"][utilisateurID].length && bdd["users"][utilisateurID][0]["name"] != name) {
                            message.reply(`La coordonnée : ${name} n'est pas définie : **${prefix}locate** pour consulter la liste de vos lieux.`)
                            return
                        }

                    }
                }
                if (!args[1]) {
                    let cooListe = [bdd.users[utilisateurID]["name"]]
                    for (i = 0; i < bdd["users"][utilisateurID].length; i++) {
                        cooListe.push(bdd.users[utilisateurID][i]["name"])
                    }
                    let cooLocate = cooListe.splice(1).join("\n>").slice(',');
                    message.channel.send(`Les coordonées enregistées sont : **\n>${cooLocate}**\ntapez **${prefix}locate {nom}** pour les consulter.`)
                }

                else {
                    message.channel.send(`ERREUR de Syntaxe : consultez **${prefix}help**`)
                }
            }
            else {
                message.channel.send("Auccune coordonnée enregistrée")
            }
        }
        else {
            message.channel.send("ERREUR, pas d'id enregistré")
        }


    }
    //===========================================================================================================================
    if (message.content.startsWith(`${prefix}locremove`)) {
        let args = message.content.trim().split(/ +/g)
        let utilisateurID = message.author.id
        if (bdd.users[utilisateurID]) {
            if (bdd.users[utilisateurID][0]) {
                if (args[1] && !args[2]) {
                    if (args[1] != "//all") {
                        let name = args[1]
                        for (i = 0; i < bdd.users[utilisateurID].length; i++) {
                            if (bdd.users[utilisateurID][i]["name"] === name) {
                                bdd.users[utilisateurID].splice(i, 1)
                                console.log(i)
                                Savebdd()
                                message.channel.send("La coordonée : **" + name + "** a été suprimée ! ")
                            }
                            if (i + 1 === bdd.users[utilisateurID].length && bdd.users[utilisateurID][i]["name"] != name) {
                                message.channel.send("La coordonnée **" + name + "** n'existe pas")
                                return
                            }
                        }
                    }
                    else {
                        bdd.users[utilisateurID] = []
                        Savebdd()
                        message.channel.send("Toutes vos coordonées ont été suprimées !")
                    }
                }
                else {
                    message.channel.send("ERREUR de Syntaxe : consultez **" + prefix + "help**.")
                }


            }
            else {
                message.channel.send("Il n'y a auccune coordonnée définie.")
            }
        }
        else {
            message.channel.send("Il n'y a auccune coordonnée définie.")
        }

    }

})
function Savebdd() {
    fs.writeFile("./bdd.json", JSON.stringify(bdd, null, 4), (err) => {
        if (err) message.channel.send("Une erreure est survenue");
    })
}
bot.login(process.env.TOKEN);
