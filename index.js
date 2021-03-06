const Discord = require('discord.js');

const auth = require('./auth');

const client = new Discord.Client();

const keywords = [ 'anwesenheit', 'attendance' ];
const roleNames = ['Schüler', 'Student'];
const emoji = '☑️';
const minutes = 3;

client.on('ready', () => {
    client.user.setActivity('YOU!', { type: 'WATCHING' });
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', (message) => {
    if (containsKeyword(message.content)) {
        let students = getStudents(message.guild);

        if (!students) {
            message.channel.send("Your server doesn't have a Student role.");
        } else {
            checkAttendance(message, students);
        }
    }
});

client.login(auth.token).catch(console.error);

function containsKeyword(message) {
    message = message.toLowerCase();

    for (const keyword of keywords) {
        if (
            message === `!${keyword}`
            || message.startsWith(`!${keyword} `)
            || message.endsWith(` !${keyword}`)
            || message.includes(` !${keyword} `)
        ) {
            return true;
        }
    }

    return false;
}

function getStudents(guild) {
    let students = guild.roles.cache.find(role => role.name === roleNames[0]);

    for (let i = 1; !students && i <= roleNames.length; i++) {
        students = guild.roles.cache.find(role => role.name === roleNames[i]);
    }

    return students.members;
}

function checkAttendance(message, students) {
    sendEmbed('Attendance check', `React with ${emoji} within the next ${minutes} minutes.`, message.channel)
        .then(message => {
            message.react(emoji).catch(console.error);
            message.awaitReactions(() => true, { time: 60000 * minutes })
                .then(collected => {
                    let absent = [];

                    for (const student of students) {
                        let present = collected.get(emoji).users.cache.values();
                        let isAbsent = true;

                        for (const presentStudent of present) {
                            if (presentStudent.id === student[0]) {
                                isAbsent = false;
                            }
                        }

                        if (isAbsent) {
                            absent.push(student);
                        }
                    }

                    sendAbsentStudents(absent, message.channel);
                })
                .catch(() => {
                    sendAbsentStudents(students, message.channel);
                });
                
        })
        .catch(console.error);
}

function sendAbsentStudents(students, channel) {
    let content = '';

    students.sort((a, b) => {
        let aName = a[1].nickname ? a[1].nickname : a[1].user.username;
        let bName = b[1].nickname ? b[1].nickname : b[1].user.username;

        return aName.localeCompare(bName);
    });

    for (const student of students) {
        content += `<@${student[0]}>\n`;
    }

    sendEmbed('Absent students', content, channel);
}

function sendEmbed(title, content, channel) {
    const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Attendance')
        .setURL('https://github.com/schollsebastian/Attendance-Discord-Bot')
        .setThumbnail('https://cdn.discordapp.com/app-icons/719873640178516068/1f584420de75f93da54f90dea38a9930.png')
        .addField(title, content)
        .setTimestamp()
	    .setFooter('created by Sebastian Scholl', 'https://cdn.discordapp.com/app-icons/719873640178516068/1f584420de75f93da54f90dea38a9930.png');

    return channel.send(embed);
}