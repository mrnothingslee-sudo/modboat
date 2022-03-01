import { Command } from "../../Command";
import { Message } from "discord.js";
const Discord = require("discord.js");

export default class Help extends Command {
    constructor (client) {
        super(client, {
            name: "help",
            description: "Displays a list of all current commands, sorted by category."
        });
    };

    async run(message: Message) {
const helphelpcpmmands = this.client.commands.map(cmd => cmd.name).join("`, `")

const embed = new Discord.MessageEmbed()
.setTitle(`Help Menu`)
.setDescription(`\`${helphelpcpmmands}\``)
message.channel.send({ embeds: [embed]})
    };
};
