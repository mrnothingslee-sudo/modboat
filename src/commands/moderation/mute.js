const ms = require('ms');

module.exports = {
    name: 'mute',
    description: 'Mutes a user.',
    usage: '[user mention or id] [reason] | [time]',
    category: 'Moderation',
    permissions: ['MANAGE_ROLES'],
    execute(client, msg, args) {
        if (!client.settings.mutedrole && !client.settings.modrole) {
            return msg.channel.send('The muted role / mod role has not been set up yet.');
        }

        const user = msg.mentions.members.first() || msg.guild.members.cache.get(args[0]) || args[0]
        const member = msg.guild.cache.member(user);
        if (member) {
            if (user.user.id === msg.author.id || user.user.id === client.user.id) {
                return msg.channel.send('You cannot mute the bot or yourself.');
            }

            if (client.settings.modrole) {
                if (member.roles.cache.has(client.settings.modrole)) {
                    return msg.channel.send('You cannot mute this user.');
                }
            }

            if (member.roles.cache.has(client.settings.mutedrole)) {
                return msg.channel.send('This user is already muted.');
            }

            member.roles.add(client.settings.mutedrole).then(() => {
                msg.channel.send(`${user.user.tag} (${user.user.id}) has been muted.`);
                const time = args.slice(1).join(' ').split('| ');
                if (time[1]) {
                    client.db.prepare('INSERT INTO mutes (id, expires) VALUES (?, ?)').run(member.id, Date.now() + ms(time[1]));
                }

                if (!client.settings.modlog) {
                    msg.channel.send(`Looks like a mod log channel hasn't been set!`);
                }

                client.channels.fetch(client.settings.modlog).then(channel => {
                    const latest = client.db.prepare('SELECT number FROM cases ORDER BY number DESC LIMIT 1').get() || {number: 0};
                    const embed = {
                        color: '2e6cc2',
                        author: {
                            name: 'Mute | Case #' + (latest.number + 1),
                            icon_url: msg.author.avatarURL()
                        },
                        description: `**User:** ${user.user.tag}\n**Moderator:** ${msg.author.tag}\n**Reason:** ${time[0] || `No reason provided. To provide a reason run \`+reason ${(latest.number + 1)}\``}${time[1] ? `\n**Time:** ${ms(ms(time[1]), {long: true})}` : ''} `,
                        footer: {
                            text: msg.guild.name,
                            icon_url: msg.guild.iconURL()
                        }
                    }
                    channel.send({
                    embeds: [embed]
                    }).then(message => {
                        client.db.prepare('INSERT INTO cases (message_id) VALUES (?)').run(message.id);
                    });
                });
            }).catch(err => {
                console.error(err);
                msg.channel.send('Failed to mute user.');
            });
        } else {
            msg.channel.send('No user provided');
        }
    }
};
