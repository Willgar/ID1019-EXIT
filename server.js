/*


	The server logic for the project is contained in this file. All get/post requests are handled here.
	Searching "TODO:" in this document will point you to the not yet implemented features of the project.

	TODO:
		Permissions, which require CAS to let us be a not Unathorized Web Service.
		All post-requests, which also either require CAS to know which user is adding data to database,
		or LDAP for certain additions (i.e. add_examiner), or both.


*/

//Exporting libraries
const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');
const db = require('./postgres');
const main_menu = require('./main_menu');
const parse_data = require('./parse_data');

//Header, navbar and footer files that are used to send back html pages.
var header = fs.readFileSync('views/header.html');
var footer = fs.readFileSync('views/footer.html');
var menu = fs.readFileSync('views/menu.html');

//Setting up the server to be able to receive post-requests properly
const app = express();
app.use(express.urlencoded());
app.use(express.json());
/* Deprecated 2020-09-03
//Setting up SSL keys (HTTPS-server):
const privateKey = fs.readFileSync('/etc/letsencrypt/live/www.exitjs.cf/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/www.exitjs.cf/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/www.exitjs.cf/chain.pem', 'utf8');
const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};
*/

//Fixing get-requests for all page views/pages, and post requests that will be added to the database
//Simple redirect:
app.get('/exitjs', (req, res) => {
	res.redirect('/');
});

//Gets view, creates main menu and sends it back to the user.
app.get('/', (req, res) => {
	var home = fs.readFileSync('views/home.html');
	if(req.user != null){
		console.log("huh");
	}
	res.send(header + menu + home + footer);
});
app.get('/login', (req, res) => {
	res.send('error');
});

//Gets view, creates main menu and sends it back to the user.
app.get('/help', (req, res) => {
	var help = fs.readFileSync('views/help.html');					//TODO: function - help page info depends on user
	res.send(header + menu + help + footer);
});

//Gets view, creates main menu and sends it back to the user.
app.get('/add_director', (req, res) => {
	var add_director = fs.readFileSync('views/add_director.html');
	res.send(header + menu + add_director + footer);
});

//Adds a director to the database
app.post('/add_director', (req, res) => {
	var user_mail = req.body.mail;
	//TODO: get ldap name
	var user_fname = 'Test';
	var user_lname = 'Add';

	db.add_director(req, res, user_mail, user_fname, user_lname);
});

//Gets view, creates main menu and sends it back to the user.
app.get('/add_budget_year', (req, res) => {
	var add_budget_year = fs.readFileSync('views/add_budget_year.html');
	res.send(header + menu + add_budget_year + footer);
});

//Adds a budget year to the database
app.post('/add_budget_year', (req, res) => {
	var budget_year = req.body;
	//TODO: logged in user instead of this:
	var director_mail = 'test_dir@kth.se';
	db.add_budget_year(req, res, director_mail, budget_year);
});

//Gets view, creates main menu and sends it back to the user.
app.get('/add_degree_project', (req, res) => {
	var add_budget_year = fs.readFileSync('views/add_degree_project.html');
	res.send(header + menu + add_budget_year + footer);
});

//Adds a degree project to the database for a specific examiner, removes hours from the examiners work year
//and adds the company + students to the database
app.post('/add_degree_project', (req, res) => {
	var post_info = req.body;
	//TODO: logged in user instead of this:
	var examiner_mail = "test_exam3@kth.se";
	db.add_degree_project(req, res, examiner_mail, post_info);
});

//Gets view, creates main menu and sends it back to the user.
app.get('/add_examiner', (req, res) => {
	var add_examiner = fs.readFileSync('views/add_examiner.html');
	res.send(header + menu + add_examiner + footer);
});

//Adds an examiner to the database
app.post('/add_examiner', (req, res) => {
	var user_mail = req.body.mail;
	//TODO: logged in user, ldap
	var director_mail = "test_dir@kth.se";
	var user_fname = "Test";
	var user_lname = "Add";

	db.add_examiner(req, res, director_mail, user_mail, user_fname, user_lname);
});

//Gets view, creates main menu, gets the examiners via parse_data and sends it back to the user.
app.get('/directors', (req, res) => {
	var directors = fs.readFileSync('views/directors.html');
	parse_data.directors((info) => {
		res.send(header + menu + directors + info + footer);
	});
});

//Gets view, creates main menu, gets the available examiners via parse_data and sends it back to the user.
app.get('/available_examiners', (req, res) => {
	var available_examiners = fs.readFileSync('views/available_examiners.html');
	parse_data.available_examiners((info) => {
		res.send(header + menu + available_examiners + info + footer);
	});
});

//Gets view, creates main menu, gets the budget years via parse_data and sends it back to the user.
app.get('/budget_years', (req, res) => {
	//TODO: cas/username to get director mail
	var director_mail = 'test_dir@kth.se';

	var budget_years = fs.readFileSync('views/budget_years.html');
	parse_data.budget_years(director_mail, (info) => {
		res.send(header + menu + budget_years + info + footer);
	});
});

//Gets view, creates main menu and sends it back to the user.
app.get('/examiners', (req, res) => {
	var examiners = fs.readFileSync('views/examiners_start.html');
	res.send(header + menu + examiners + footer);
});

//Adds examiner to the database via postgres.js
app.post('/examiners', (req, res) => {
	//TODO: cas/username to get director mail
	var director_mail = 'test_dir@kth.se';

	var budget_year = req.body.budget_year;
	var examiners = fs.readFileSync('views/examiners.html');

	parse_data.examiners(director_mail, budget_year, (info) => {
		res.send(header + menu + examiners + info + footer);
	});
});

//Gets view, creates main menu, gets the degree projects via parse_data and sends it back to the user.
app.get('/degree_projects', (req, res) => {
	//TODO: cas/username to get director mail
	var examiner_mail = 'test_exam3@kth.se';
	var degree_project = fs.readFileSync('views/degree_project.html');
	parse_data.degree_projects(examiner_mail, (info) => {
		res.send(header + menu + degree_project + info + footer);
	});
});

//Gets view, creates main menu, gets the degree projects via parse_data and sends it back to the user.
app.get('/get_degree_project', (req, res) => {
	console.log('req.query.id: ' + req.query.id);
	var id = req.query.id;
	parse_data.get_degree_project(id, (info) => {
		res.send(info);
	});
});

//Marks a project as "finished" in the database
app.post('/mark_as_finished', (req, res) => {
	var id = req.query.id;
	db.mark_as_finished(req, res, id);
});

//Gets view, creates main menu, gets the profile via parse_data and sends it back to the user.
app.get('/profile', (req, res) => {
	//TODO: cas/username to get examiner mail
	var examiner_mail = 'test_exam3@kth.se';
	var profile = fs.readFileSync('views/profile.html');

	parse_data.profile(examiner_mail, (info) => {
		res.send(header + menu + profile + info + footer);
	});
});

//Updates area in the database
app.post('/update_area', (req, res) => {
	//TODO: cas/username to get examiner mail
	var examiner_mail = 'test_exam3@kth.se';

	var updated = fs.readFileSync('views/success.html');

	console.log("Update area: " + req.body.area);
	db.update_area(examiner_mail, req.body.area, (success) => {
		if(success){
			res.send(header + menu + updated + footer);
		} else {
			res.send('Error when updating area');
		}
	});
});

//Gets view, creates main menu, gets the specified tutoring hours for examiners via parse_data and sends it back to the user.
app.get('/specify_tutoring_hours', (req, res) => {
	//TODO: cas/username to get examiner mail
	var director_mail = 'test_dir@kth.se';
	var profile = fs.readFileSync('views/specify_tutoring_hours.html');

	parse_data.specify_tutoring_hours(director_mail, (info) => {
		res.send(header + menu + profile + info + footer);
	});
});

//Updates the database with the specified tutoring hours to the specified examiner
app.post('/specify_tutoring_hours', (req, res) => {
	//TODO: cas/username to get examiner mail
	var director_mail = 'test_dir@kth.se';
	var post_info = req.body;

	db.specify_tutoring_hours(req, res, director_mail, post_info);
});


var appDir = path.dirname(require.main.filename);

//Fixing get requests for css files and images
app.get('/styles/form.css', (req, res) => {
	res.sendFile(appDir+'/styles/form.css');
});

app.get('/styles/main.css', (req, res) => {
	res.sendFile(appDir+'/styles/main.css');
});

app.get('/styles/print.css', (req, res) => {
	res.sendFile(appDir+'/styles/print.css');
});

app.get('/styles/screen.css', (req, res) => {
	res.sendFile(appDir+'/styles/screen.css');
});

app.get('/images/kthexit.png', (req, res) => {
	res.sendFile(appDir+'/images/kthexit.png');
});

app.get('/images/kth.png', (req, res) => {
	res.sendFile(appDir+'/images/kth.png');
});

/* Deprecated 2020-09-03
//Listen to 443 for https server and redirecting http requests to https.
const httpsServer= https.createServer(credentials, app);

httpsServer.listen(443, () => {
	console.log('HTTPS Server running');
});

//http (port 80) only redirects to https server (port 443)
const http = require('http');
http.createServer(function (req, res) {
	res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
	res.end();
}).listen(80);
*/

const port = 8080;
app.listen(port, () => {
	console.log(`EXIT listening on port ${port}!`)
});
