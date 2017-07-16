const mongoose = require("mongoose");

require('dotenv').config({path : 'variables.env'});
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise;
mongoose.connection.on('error', (err) => {
	console.log(`There is error message - ${err.message}`);
})

require('../models/User')

const server = require("./server.js");