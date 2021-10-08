/*
	Deprecated 2021-10-08
	main_menu.js contains only one function, create_main_menu which creates the main menu of the website
	This is done based on which page is currently being viewed.

	TODO:
		Limit entries based on logged in user (see nodejs passport documentation on sessions) - requires CAS.

*/

const create_main_menu = (req) => {
	var ret = "<div id=\"mainmenu\"><ul>";

	if(req.path == '/'){
		ret += "<li class=\"active\"><a href=\"/\">Home</a></li>";
	} else {
		ret += "<li><a href=\"/\">Home1</a></li>";
	}

	ret += "<li><a href=\"/login\">Log in</a></li>";

	if(req.path == '/help'){
		ret += "<li class=\"active\"><a href=\"/help\">Help</a></li>";
	} else {
		ret += "<li><a href=\"/help\">Help</a></li>";
	}

	if(req.path == '/add_director'){
		ret += "<li class=\"active\"><a href=\"/add_director\">Add director</a></li>";
	} else {
		ret += "<li><a href=\"/add_director\">Add director</a></li>";
	}

	if(req.path == '/directors'){
		ret += "<li class=\"active\"><a href=\"/directors\">Directors</a></li>";
	} else {
		ret += "<li><a href=\"/directors\">Directors</a></li>";
	}

	if(req.path == '/add_budget_year'){
		ret += "<li class=\"active\"><a href=\"/add_budget_year\">Add budget year</a></li>";
	} else {
		ret += "<li><a href=\"/add_budget_year\">Add budget year</a></li>";
	}

	if(req.path == '/budget_years'){
		ret += "<li class=\"active\"><a href=\"/budget_years\">Budget years</a></li>";
	} else {
		ret += "<li><a href=\"/budget_years\">Budget years</a></li>";
	}

	if(req.path == '/add_examiner'){
		ret += "<li class=\"active\"><a href=\"/add_examiner\">Add examiner</a></li>";
	} else {
		ret += "<li><a href=\"/add_examiner\">Add examiner</a></li>";
	}

	if(req.path == '/examiners'){
		ret += "<li class=\"active\"><a href=\"/examiners\">Examiners</a></li>";
	} else {
		ret += "<li><a href=\"/examiners\">Examiners</a></li>";
	}

	if(req.path == '/specify_tutoring_hours'){
		ret += "<li class=\"active\"><a href=\"/specify_tutoring_hours\">Specify tutoring hours</a></li>";
	} else {
		ret += "<li><a href=\"/specify_tutoring_hours\">Specify tutoring hours</a></li>";
	}

	if(req.path == '/add_degree_project'){
		ret += "<li class=\"active\"><a href=\"/add_degree_project\">Add degree project</a></li>";
	} else {
		ret += "<li><a href=\"/add_degree_project\">Add degree project</a></li>"
	}

	if(req.path == '/degree_projects'){
		ret += "<li class=\"active\"><a href=\"/degree_projects\">Degree projects</a></li>";
	} else {
		ret += "<li><a href=\"/degree_projects\">Degree projects</a></li>";
	}

	if(req.path == '/profile'){
		ret += "<li class=\"active\"><a href=\"/profile\">Profile</a></li>";
	} else {
		ret += "<li><a href=\"/profile\">Profile</a></li>";
	}

	if(req.path == '/available_examiners'){
		ret += "<li class=\"active\"><a href=\"/available_examiners\">Available examiners</a></li>";
	} else {
		ret += "<li><a href=\"/available_examiners\">Available examiners</a></li>";
	}

	ret += "</ul></div>";
	return ret;
}

module.exports = {
	create_main_menu,
};
