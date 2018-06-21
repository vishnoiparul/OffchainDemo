var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const session = require('express-session')
const cookieParser = require('cookie-parser')


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

const wallet = require('./services/wallet')
const task = require('./services/task')

var port = "2907";

app.set('view engine', 'ejs');

//Setting up session
app.use(cookieParser());
app.use(cookieParser('walletsecret'))
app.use(session({
	key	: 'app.sess',
	secret : 'walletsecret',
	resave : true,
	saveUninitialized : false,
	cookie : {
		maxAge : 10*60*1000
	}
}))
app.use(express.Router())

app.get('/', (req,res) => {
	res.render('index')
})

app.post('/wallet',wallet.createWallet)
app.post('/channel',task.createChannel)
app.post('/transaction',task.sendTask)
app.get('/receive',task.receiveTask)
app.get('/closeRequest',task.requestClosure)

app.listen(port, () => {
	console.log("Server created at Port " + port);
	console.log("Running at http://localhost:%s", port);
})