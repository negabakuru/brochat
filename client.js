'use strict'

const readline = require('readline')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})
const program = require('commander')
const spacebroClient = require('spacebro-client')

let hostValue
let portValue
let username
let channel

let maxHistory = process.stdout.rows
let chatHistory = []

if (!Date.now) {
  Date.now = function () { return new Date().getTime(); }
}

parseArgs()
spacebroClient.connect(hostValue, portValue, {
  clientName: username,
  channelName: channel,
  verbose: false
})
spacebroClient.once('new-member', startChat)

function parseArgs () {
  program.version('0.0.14')
    .usage('[options] <host> <port>')
    .arguments('<host> <port>')
    .action(function (host, port) {
      hostValue = host
      portValue = port
    })
    .option('-u, --user [name]', 'Set username')
    .option('-c, --channel [name]', 'Join channel')
  program.parse(process.argv)

  if (!hostValue || !portValue) {
    program.outputHelp()
    console.log(!hostValue ? '\nNo host given.' : 'No port given.')
    process.exit()
  }

  username = program.user || 'Visitor'
  channel = program.channel || 'random'
}

function startChat (data) {
  displayMessages()
  addEvents()
  spacebroClient.emit('user-connected', { username: username })
}

function addEvents () {
  spacebroClient.on('user-connected', function (data) {
    addNewMessage({
      timestamp: getTime(),
      user: '',
      message: `${data.username} has connected !`
    })
    displayMessages()
  })

  rl.on('line', (input) => {
    let time = getTime()
    spacebroClient.emit('new-message', {user: username, message: input, timestamp: time})
  })

  spacebroClient.on('new-message', (data) => {
    addNewMessage(data)
    displayMessages()
  })
}

function getTime () {
  let date = new Date()
  let hours = (date.getHours() < 10 ? '0' : '') + date.getHours().toString()
  let minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes().toString()
  let seconds = (date.getSeconds() < 10 ? '0' : '') + date.getSeconds().toString()

  let datenow = hours + ':' + minutes + ':' + seconds
  return datenow
}

function addNewMessage (data) {
  let newMessage = `[${data.timestamp}] ${data.user}: ${data.message}`

  if (chatHistory.length >= maxHistory) {
    chatHistory.shift()
    chatHistory.push(newMessage)
  } else {
    chatHistory.push(newMessage)
  }
}

function displayMessages () {
  console.log('\x1Bc')
  chatHistory.forEach((message) => {
    console.log(message)
  })
}
