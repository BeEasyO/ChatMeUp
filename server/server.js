const path = require('path');
const http = require('http');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const promisify = require('es6-promisify');
const hbs = require('hbs');
const cookieParser = require('cookie-parser');
const socketIO = require("socket.io");
const routes = require('../routes/index');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash        = require('connect-flash');
const helpers = require('./helpers');
const errorHandlers = require('../handlers/erros');

require('../handlers/passport');


const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation.js');
const {Users} = require('./utils/users.js');

const publicPath = path.join(__dirname, '../public');
const partialsHbs = path.join(__dirname, '../views/partials');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);

var io = socketIO(server);
var users = new Users();

hbs.localsAsTemplateData(app);
hbs.registerHelper('json', function(context) {
    return JSON.stringify(context, null, 2);
});
hbs.registerPartials(partialsHbs);

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'hbs');
app.use(express.static(publicPath));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(cookieParser());
app.use(session({ 
	secret: process.env.SECRET,
	key: process.env.KEY,
	resave: false,
	saveUnitialized:false,
	//store: new MongoStore({ mongooseConnection: mongoose.connection})
 }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
  res.locals.h = helpers;
  res.locals.m = {
  	name:"bla0",
  	famile: true
  }
  res.locals.flashes = req.flash();
  res.locals.user = req.user || null;
  res.locals.currentPath = req.path;
  next();
});

app.use((req, res, next) => {
  req.login = promisify(req.login, req);
  next();
});

app.use('/', routes);


io.on('connection', (socket) => {
	console.log("new user connected");

	

	socket.on('join', (params, callback) => {
		if(!isRealString(params.name) || !isRealString(params.room)){
			return callback("Name and room name are required");
		}
		var room = params.room.toUpperCase();
		if(users.isUserExistInRoom(params.name, room)) {
			return callback(`There is ${params.name} in ${params.room} room. Try a different name pls`);
		}
		var room = params.room.toUpperCase();
		socket.join(room);
		users.removeUser(socket.id);
		users.addUser(socket.id, params.name, room);

		io.to(room).emit('updateUserList', users.getUsersList(room));
		socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
		socket.broadcast.to(room).emit('newMessage', generateMessage('Admin', `${params.name} has joined`));

		callback();
	});

	socket.on("createMessage", (message, callback) => {
		var user = users.getUser(socket.id);
		if(user && isRealString(message.text)){
			io.to(user.room).emit("newMessage", generateMessage(user.name, message.text));
		}
		
		callback();
	});

	socket.on("createLocationMessage", (coords) =>{
		var user = users.getUser(socket.id);
		if(user){
			io.to(user.room).emit("newLocationMessage", generateLocationMessage(user.name, coords.latitude, coords.longitude));
		}
	});

	socket.on("disconnect", () => {
		var user = users.removeUser(socket.id);

		if(user){
			io.to(user.room).emit("updateUserList", users.getUsersList(user.room));
			io.to(user.room).emit("newMessage", generateMessage('Admin', `${user.name} has left`));
		}
	});
});

//app.use(errorHandlers.notFound);

// One of our error handlers will see if these errors are just validation errors
//app.use(errorHandlers.flashValidationErrors);

// Otherwise this was a really bad error we didn't expect! Shoot eh
//if (app.get('env') === 'development') {
  /* Development Error Handler - Prints stack trace */
 // app.use(errorHandlers.developmentErrors);
//}

// production error handler
//app.use(errorHandlers.productionErrors);

server.listen(port, () => {
	console.log(`Server is up on ${port}`);
})