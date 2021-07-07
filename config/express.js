var express = require('express'),
	stylus = require('stylus'),
	nib = require('nib'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser')
	logger = require('morgan')
	passport = require('passport')
	session = require('express-session'),
	mongoose = require('mongoose'),
	mongoStore = require('connect-mongo')(session)

//
module.exports = function(app, config){
	app.use(logger('dev'))

	app.use(stylus.middleware({
		src: config.rootPath + '/public/css',
		compile: function(str, path){
			return stylus(str).set('filename', path).set('compress', true).use(nib())
		}
	}))

	app.use(express.static(config.rootPath + '/public'))
	app.use('/vendor', express.static(config.rootPath + '/vendor'))

	app.set('view engine', 'pug')
	app.use(cookieParser())
	app.use(bodyParser.json())
	app.use(bodyParser.urlencoded({ extended: true }))
	app.use(session({
		secret: config.secret,
		resave: true,
		saveUninitialized: true,
		store: new mongoStore({ mongooseConnection: mongoose.connection }),
		cookie: { path: '/', httpOnly: true, secure: false, maxAge: 60 * 60 * 24 * 14 } // 14 days
	}))
	app.use(passport.initialize())
	app.use(passport.session())
	// app.use(allowCrossDomain)
}

function allowCrossDomain(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*')
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
	res.header('Access-Control-Allow-Headers', 'Content-Type')
	res.header("Access-Control-Allow-Credentials", true)
	next()
}

