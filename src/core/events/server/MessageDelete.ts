import {Event} from "../../Event";
import {Message, MessageEmbed, TextChannel} from "discord.js";
import Schema from "../../../models/guild";

export default class MessageDelete extends Event {
    constructor(client) {
        super(client, {
            name: "messageDelete",
            once: false
        });
    };
    async run(message: Message) {
        const data = await Schema.findOne({ Guild: message.guild.id });
        if (!data || !data.LogChannel) {
            return;
        }; 

        if (!message.guild.me.permissions.has('SEND_MESSAGES')) {
            return;
        };

        if (!message.guild.me.permissions.has("EMBED_LINKS")) {
            return;
        };

        const channel = message.guild.channels.cache.get(data.LogChannel) as TextChannel;
        if (!channel) {
            return;
        };
        if (channel) {
            channel.send({
                embeds: [
                    new MessageEmbed()
                    //@ts-ignore
                    .setColor(this.client.color.red)
                    .setDescription(`<@${message.author.id}> | ${message.author.tag} (${message.author.id})\ndeleted a message in <#${message.channel.id}>\n`)
                    .addField('Deleted Message:', `${message.content ? message.content : `[No messages found](${message.attachments.first() ? message.attachments.first().proxyURL : null}).`}`)
                    .setImage(message.attachments.first() ? message.attachments.first().proxyURL : null)
                    .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                ]
            })
        }
    }
}