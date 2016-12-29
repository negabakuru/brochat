'use strict'

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})
const program = require('commander')
const spacebroClient = require('spacebro-client')

let hostValue
let portValue

program.version('0.0.1')
.usage('[options] <host> <port>')
.arguments('<host> <port>')
.action(function (host, port) {
    hostValue = host
    portValue = port
    console.log(hostValue + '   ' + portValue)
})
.option('-u, --user [name]', 'Set username')
.option('-c, --channel [name]', 'Join channel')
program.parse(process.argv)

if (!hostValue || !portValue) {
    console.log(!hostValue ? 'No host given.' : 'No port given.')
    process.exit()
}

let username = program.user || 'Visitor'
let channel = program.channel || 'random'

spacebroClient.connect(hostValue, portValue, {
    clientName: username,
    channelName: channel,
    verbose: false
})
setTimeout(() => {spacebroClient.emit('user-connected', {username: username})}, 1000)
spacebroClient.on('user-connected', function (data) { console.log(`${data.username} has connected !`) })

let maxHistory = process.stdout.rows
let chatHistory = []

if (!Date.now) {
    Date.now = function() { return new Date().getTime(); }
}

function getTime () {
    let date = new Date()
    let hours = (date.getHours() < 10 ? '0' : '') + date.getHours().toString()
    let minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes().toString()
    let seconds = (date.getSeconds() < 10 ? '0' : '') + date.getSeconds().toString()
    
    let datenow = hours + ':' + minutes + ':' + seconds
    return datenow
}

rl.on('line', (input) => {
    let time = getTime()
    spacebroClient.emit('new-message', {user: username, message: input, timestamp: time})
})

spacebroClient.on('new-message', (data) => {
    let newMessage = `[${data.timestamp}] ${data.user}: ${data.message}`
    
    if (chatHistory.length >= maxHistory) {
	chatHistory.shift()
	chatHistory.push(newMessage)
    } else {
	chatHistory.push(newMessage)
    }

    console.log('\x1Bc')
    chatHistory.forEach((message) => {
	console.log(message)
    })
})
