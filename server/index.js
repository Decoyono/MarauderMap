const path = require('path');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const db = require('./db');
const fs = require('fs')
const store = new SequelizeStore({ db });
const PORT = process.env.PORT || 8080;
const app = express();
const httpsOptions = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem')
}
var https = require('https');
var server = https.createServer(httpsOptions, app);
var socketio = require('socket.io');
var io = socketio(server);

//console.log('io', io.sockets)
module.exports = app;

// if (process.env.NODE_ENV === 'development') require('../secrets');
require('../secrets');

passport.serializeUser((user, done) =>
  done(null, user.id));

passport.deserializeUser((id, done) =>
  db.models.user.findById(id)
    .then(user => done(null, user))
    .catch(done));

const createApp = () => app
  .use(morgan('dev'))
  .use(express.static(path.join(__dirname, '..', 'public')))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(session({
    secret: process.env.SESSION_SECRET || 'my best friend is Cody',
    store,
    resave: false,
    saveUninitialized: false
  }))
  .use(passport.initialize())
  .use(passport.session())
  .use('/auth', require('./auth'))
  .use('/api', require('./api'))
  .use((req, res, next) =>
    path.extname(req.path).length > 0 ? res.status(404).send('Not found') : next())
  .use('*', (req, res) =>
    res.sendFile(path.join(__dirname, '..', 'public/index.html')))
  .use((err, req, res, next) =>
    res.status(err.status || 500).send(err.message || 'Internal server error.'));

io.on('connection', function(socket) {
  console.log(socket.id, 'connected')
  socket.on('gps', function(data){
    socket.broadcast.emit('gps', data);
  });
});

const syncDb = () =>
  db.sync();


const listenUp = () =>
  server.listen(PORT, () =>
    console.log(`Mixing it up on port ${PORT}`));

// This evaluates as true when this file is run directly from the command line,
// i.e. when we say 'node server/index.js' (or 'nodemon server/index.js', or 'nodemon server', etc)
// It will evaluate false when this module is required by another module - for example,
// if we wanted to require our app in a test spec
if (require.main === module) {
  store.sync()
    .then(syncDb)
    .then(createApp)
    .then(listenUp);
} else {
  createApp(app);
}


