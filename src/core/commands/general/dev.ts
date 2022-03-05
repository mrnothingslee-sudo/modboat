import {Interaction, Message, MessageEmbed} from "discord.js";
import { Command } from "../../Command";
import { exec } from "child_process";


export default class ping extends Command {
    constructor(client) {
        super(client, {
            name: "dev",
            description: "mmm yes dev"
        });
    };

    async run(message: Message, args: string[]) {
        if (!process.env.developers.includes(message.author.id)) return;

        switch(args[0].toLowerCase()) {
            case "override":

                switch(args[1].toLowerCase()) {
                    case "kick":
                        const member = message.mentions.members.first() || message.guild.members.cache.get(args[2]);

                        if (!args[2]) {
                            return message.reply({
                                content: "I need to know the user"
                            }).catch(() => {
                                return;
                            });
                        };

                        if (!member) {
                            return message.reply({
                                content: "This user might not be in the server"
                            }).catch(() => {
                                return;
                            });
                        };

                        if (member.id === message.author.id) {
                            return message.reply({
                                content: "You can't ban your self!"
                            });
                        };

                        if (!member.kickable) {
                            return message.reply({
                                content: "This user either has a higher permission then me or same permission as me meaning i am unable to ban them"
                            }).catch(() => {
                                return;
                            });
                        };

                        let reason = args[3] || "No reason given";

                        return member.kick(reason).then(async () => {
                            await this.service.logger.modlogs({
                                client: this.client,
                                message: message,
                                moderator: message.member,
                                reason: reason || null,
                                //@ts-ignore
                                user: String(member.user.tag),
                                userid: String(member.user.id),
                                title: 'Kick',
                                color: '#ff7f50',
                                warn: true,
                                timeout: false
                            })
                            return message.reply({
                                content: "User has been kicked."
                            }).catch(() => {
                                return;
                            });
                        }).catch(() => {
                            return message.reply({
                                content: "An error has happend. Please join and tell the support server about the error. The support server link can be found on the docs."
                            }).catch(() => {
                                return;
                            });
                        });
                        break;

                        case "ban":
                            const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

                            if (!args[2]) {
                                return message.reply({
                                    content: "I need to know the user!"
                                }).catch(() => {
                                    return;
                                });
                            };

                            if (!user) {
                                return message.reply({
                                    content: "This user might not be in the server!"
                                }).catch(() => {
                                    return;
                                });
                            };

                            if (user.id === message.author.id) {
                                return message.reply({
                                    content: "You can't ban your self!"
                                });
                            };

                            if (!user.bannable) {
                                return message.reply({
                                    content: "This user either has a higher permission then me or same permission as me meaning i am unable to ban them!"
                                }).catch(() => {
                                    return;
                                });
                            };

                            let banReason = args[3] || "No reason given";

                            return member.ban({
                                reason: banReason
                            }).then(async () => {
                                await this.service.logger.modlogs({
                                    client: this.client,
                                    message: message,
                                    moderator: message.member,
                                    reason: banReason || null,
                                    //@ts-ignore
                                    user: String(user.user.tag),
                                    userid: String(user.user.id),
                                    title: 'Ban',
                                    color: '#dc3b3b',
                                    warn: true,
                                    timeout: false
                                })
                                return message.reply({
                                    content: "User has been banned."
                                }).catch(() => {
                                    return;
                                });
                            }).catch(() => {
                                return message.reply({
                                    content: "An error occurred."
                                }).catch(() => {
                                    return;
                                });
                            });
                        break;

                }
                break;
            case "build":
                exec("yarn build", (err, stdout, stderr) => {
                    if (err) {
                        return message.channel.send({
                            embeds: [
                                new MessageEmbed()
                                    .setDescription(`\`\`\`${err}\`\`\``)
                                    .setColor("RED")
                                    .setFooter({text: "Smooth brain, you failed."}),
                            ],
                        });
                    }
                    if(stdout) {
                         message.channel.send({
                            content: "Build successful!"
                        })

                        setTimeout(() => {
                             message.channel.send("Restarting...")
                            exec("pm2 restart 0")
                        }, 5000);
                    }
                });

                break;
            default:
                return message.channel.send("Available args: `override <kick/ban>`")
                break;
        }
    };
};