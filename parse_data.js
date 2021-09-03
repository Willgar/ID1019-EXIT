/*
	
	Functions in parse_data are called from server.js, call postgres to get the "raw" data and then parse it into html code
	that will be displayed to the user.

*/


const db = require('./postgres');

const directors = (callback) => {
	db.get_directors((result) => {
		console.log(result.rows);
		if(result.rowCount == 0){
			callback(`
						</table>
						<p>There are currently no director of studies added to the database.</p>
					</div>
				</div>`);
		} else {
			var i;
			var ret = "";
			for(i = 0; i < result.rowCount; i++){
				var row = result.rows[i];
				ret += "<tr><td>" + row.last_name + "</td><td>" + row.first_name + "</td><td>" + row.mail + "</td></tr>\n";
			}
			ret += "</table>\n</div>\n</div>";
			callback(ret);
		}
	});
}

const examiners = (director_mail, budget_year, callback) => {
	db.get_examiners(director_mail, budget_year, (result) => {
		console.log(result.rows);
		if(result.rowCount == 0){
			callback(`
						</table>
						<p>There are currently no examiners added to the specified budget year.</p>
					</div>
				</div>`);
		} else {
			var i;
			var ret = "";
			for(i = 0; i < result.rowCount; i++){
				var row = result.rows[i];
				ret += "<tr><td>" + row.last_name + "</td><td>" + row.first_name + "</td><td>" + row.mail + "</td><td>" + row.area + "</td><td>";
				ret += row.tutoring_hours + "</td><td>" + row.remaining_tutoring_hours + "</td></tr>\n";
			}
			ret += "</table>\n</div>\n</div>";
			callback(ret);
		}
	});
}

const degree_projects = (examiner_mail, callback) => {
	db.get_degree_projects(examiner_mail, (result) => {
		if(result.rowCount == 0){
			callback(`
						</table>
						<p>There are currently no active degree projects registered.</p>
					</div>
				</div>`);
		} else {
			var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth();
			var yyyy = today.getFullYear();
			var date = yyyy + "-" + mm + "-" + dd;			
			
			var i;
			var ret = "";
			for(i = 0; i < result.rowCount; i++){
				var row = result.rows[i];
				if(row.in_progress != false){
					//Update projects out_of_date variable if necessary				
					var text_color = "green";
					var degree_status = "Yes";
				
					console.log(row.start_date);
					console.log(row.stop_date);
				
					if(row.stop_date < date){
						db.update_date_project(row.id);
						text_color = "red";
						degree_status = "No";
					}
				
					//Pop-up window?
					ret += "<tr><td>" + row.credits + "</td><td><a href=\"/get_degree_project?id=" + row.id + "\" onclick=\"window.open('/get_degree_project?id=" + row.id + "', ";
					ret += "'popup','width=600,height=300,scrollbars=yes,resizable=yes,toolbar=no,directories=no,location=no,menubar=no,status=no,left=50,top=0');";
					ret += "return false\">" + row.description + "</a></td>";
				
					ret += "<td>" + row.number_of_students + "</td><td>" + row.start_date + "</td><td>" + row.stop_date + "</td>" 
					ret += "<td><font color = \"" + text_color + "\">" + degree_status + "</font></td></tr>\n";				
				}
			}
			ret += "</table>\n</div>\n</div>";
			callback(ret);
		}
	});
}

const get_degree_project = (id, callback) => {
	db.get_degree_project_desc(id, (desc) => {
		console.log(desc.rows);
		if(desc.rowCount == 0){
			callback('Error');
		} else {
			var degree_desc = desc.rows[0].description;
			db.get_degree_project_students(id, (students_info) => {
				console.log(students_info.rows);
				if(students_info.rowCount == 0){
					callback('Error');
				} else {
					db.get_degree_project_company(id, (company_info) => {
						console.log(company_info.rows);
						var ret = "";
						//adding css styles
						ret += `
						<head>	
							<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
							<meta name="language" content="en" />

							<!-- blueprint CSS framework -->
							<link rel="stylesheet" type="text/css" href="/styles/screen.css" media="screen, projection" />
							<link rel="stylesheet" type="text/css" href="/styles/print.css" media="print" />
							<link rel="stylesheet" type="text/css" href="/styles/main.css" />
							<link rel="stylesheet" type="text/css" href="/styles/form.css" />
    
							<title > EXIT - Examiners in information technology </title>
	
	 						<link rel="shortcut icon" href="https://www.kth.se/img/icon/favicon.ico">

						</head>`;				
						
						
						ret += "<table border=\"0\" cellspacing=\"0\" cellpadding=\"0\"><center><b>" + degree_desc + "</b></center>";
						ret += "<tr><td><b>Student name</b></td><td><b>Personal number</b></td><td><b>KTH mail</b></td>";
						ret += "<td><b>Alternative mail</b></td><td><b>Program</b></td></tr>";
						
						var i = 0;
						for(i = 0; i < students_info.rowCount; i++){
							var row = students_info.rows[i];
							ret += "<tr><td>" + row.first_name + ' ' + row.last_name + "</td><td>" + row.personal_number + "</td>";
							ret += "<td>" + row.kth_mail + "</td><td>" + row.alternative_mail + "</td><td>" + row.program + "</td></tr>";
						}
						ret += "</table><br />";
												
						if(company_info.rowCount != 0){
							var row = company_info.rows[0];
							ret += "<b>Company name: </b>" + row.name + "<br /><b>Address: </b>" + row.address + "<br />";
							ret += "<b>Phone number: </b>" + row.phone_number + "<br /><b>Tutor: </b>" + row.tutor + "<br /><br />";
						}
						
						ret += "<form method=\"POST\" action=\"/mark_as_finished?id=" + id + "\">";
						ret += "<input type=\"submit\" name=\"submit\" value=\"Mark as finished/cancelled\" onclick=\"return(confirm('Are you sure want to mark this degree project as finished/cancelled?'))\">";;
						ret += "</form";
						
						callback(ret);
					});
				}								
			});
		}
	});
}

const available_examiners = (callback) => {
	db.get_available_examiners((result) => {
		console.log(result.rows);
		if(result.rowCount == 0){
			callback(`
						</table>
						<p>There are currently no avaible examiners.</p>
					</div>
				</div>`);
		} else {
			var i;
			var ret = "";
			for(i = 0; i < result.rowCount; i++){
				var row = result.rows[i];
				ret += "<tr><td>" + row.last_name + "</td><td>" + row.first_name + "</td><td>" + row.mail + "</td><td>" + row.area + "</td></tr>\n";
			}
			ret += "</table>\n</div>\n</div>";
			callback(ret);
		}
	});
}

const budget_years = (director_mail, callback) => {
	db.get_budget_years(director_mail, (result) => {
		if(result.rowCount == 0){
			callback(`
						</table>
						<p>There are currently no budget years registered.</p>
					</div>
				</div>`);
		} else {
			var i;
			var ret = "";
			for(i = 0; i < result.rowCount; i++){
				var row = result.rows[i];
				ret += "<tr><td>" + row.budget_year + "</td><td>" + row.master_hours + "</td><td>" + row.bachelor_hours + "</td><td>" + row.factor_two + "</td><td>";
				ret += row.factor_three + "</td><td>" + row.factor_four + "</td><td>" + row.factor_five + "</td><td>" + row.factor_six + "</td><td>";
				ret += row.factor_seven + "</td><td>" + row.factor_eight + "</td><td>" + row.factor_nine + "</td><td>" + row.factor_ten + "</td></tr>";
			}			
			ret += "</table>\n</div>\n</div>";
			callback(ret);
		}
	});
}

const profile = (examiner_mail, callback) => {
	db.get_tutoring_hours(examiner_mail, (hours) => {
		if(hours.rowCount == 0){
			callback("An error has occurred.");
			return;
		}
		console.log(hours.rows[0]);
		
		db.get_examiner_area(examiner_mail, (area_info) => {
			db.get_budget_year(examiner_mail, (budget_year_info) => {
				var tutoring_hours = hours.rows[0].tutoring_hours;
				var r_tutoring_hours = hours.rows[0].remaining_tutoring_hours;
				var area;
				if(area_info.rowCount == 0){
					area = "";
				} else {
					var area = area_info.rows[0].area;
					console.log(area);
				}
		
				var ret = "<p>Expected tutoring hours this budget year: <b>" + tutoring_hours + "</p></b><br />\n";
				ret += "<p>Tutoring hours left this budget year: <b>" + r_tutoring_hours + "</></b><br /><br />\n";
			
				ret += "<p><b>Competence area: </b><p><tr><td>" + area + "</td></tr><br />";
				ret += "<form method=\"POST\" action=\"/update_area\">";
				ret += "<b>Update area:</b><br /> <input type=\"text\" name=\"area\">";
				ret += "<br /><br /><button type=\"submit\">Submit</button></form><br /><br />";
				
				ret += "<h2> Current budget year information </h2>";
				
				console.log(budget_year_info.rows[0]);			
				if(budget_year_info.rowCount != 0){
					var budget_year = budget_year_info.rows[0];
					ret += "<table width=\"200\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">"
					ret += "<tr><td width=\10%\"><b>Number of students</b><br /></td>";
					ret += "<td width=\10%\"><b>Master hours</b><br /></td>";
					ret += "<td width=\10%\"><b>Bachelor hours</b><br /></td>";
					ret += "<td></td><td></td><td></td></tr>";
					ret += "<p>This table shows how many hours will be subtracted from your quota if you add a degree project</p>";
					
					//10 students....
					ret += "<tr><td>" + 1 + "</td><td>" + budget_year.master_hours + "</td><td>" + budget_year.bachelor_hours + "</td></tr>";
					ret += "<tr><td>" + 2 + "</td><td>" + budget_year.master_hours*budget_year.factor_two + "</td><td>" + budget_year.bachelor_hours*budget_year.factor_two + "</td></tr>";
					ret += "<tr><td>" + 3 + "</td><td>" + budget_year.master_hours*budget_year.factor_three + "</td><td>" + budget_year.bachelor_hours*budget_year.factor_three + "</td></tr>";
					ret += "<tr><td>" + 4 + "</td><td>" + budget_year.master_hours*budget_year.factor_four + "</td><td>" + budget_year.bachelor_hours*budget_year.factor_four + "</td></tr>";
					ret += "<tr><td>" + 5 + "</td><td>" + budget_year.master_hours*budget_year.factor_five + "</td><td>" + budget_year.bachelor_hours*budget_year.factor_five + "</td></tr>";
					ret += "<tr><td>" + 6 + "</td><td>" + budget_year.master_hours*budget_year.factor_six + "</td><td>" + budget_year.bachelor_hours*budget_year.factor_six + "</td></tr>";
					ret += "<tr><td>" + 7 + "</td><td>" + budget_year.master_hours*budget_year.factor_seven + "</td><td>" + budget_year.bachelor_hours*budget_year.factor_seven + "</td></tr>";
					ret += "<tr><td>" + 8 + "</td><td>" + budget_year.master_hours*budget_year.factor_eight + "</td><td>" + budget_year.bachelor_hours*budget_year.factor_eight + "</td></tr>";
					ret += "<tr><td>" + 9 + "</td><td>" + budget_year.master_hours*budget_year.factor_nine + "</td><td>" + budget_year.bachelor_hours*budget_year.factor_nine + "</td></tr>";
					ret += "<tr><td>" + 10 + "</td><td>" + budget_year.master_hours*budget_year.factor_ten + "</td><td>" + budget_year.bachelor_hours*budget_year.factor_ten + "</td></tr>";
					ret += "</table>";
				} else {
					ret += "<p>No info available for the current budget year.</p>";	
				}

				ret += "\n</div>\n</div>";
				callback(ret);
			});
		});
	});
}

const specify_tutoring_hours = (director_mail, callback) => {
	db.get_all_examiners(director_mail, (examiners) => {
		var ret = "";
		var i;
		for(i = 0; i < examiners.rowCount; i++){
			var row = examiners.rows[i];
			ret += "<tr><td>" + row.last_name + "</td><td>" + row.first_name + "</td><td>" + row.mail + "</td></tr>";
		}
		ret += "</table><br /><br />";
		db.get_all_budget_years(director_mail, (budget_years)=> {
			if(budget_years.rowCount == 0){
				ret += "Please add budget years before trying to specify budget hours.";
				callback(ret);
				return;
			}

			//ret += "Fields with <font color = \"red\">*</font> are required."; - alla fields?
			ret += "<form method=\"POST\" action=\"\"><br />";
			ret += "Year: <select name=\"year\"><br />"
			var j;
			for(j = 0; j < budget_years.rowCount; j++){
				var row2 = budget_years.rows[j];
				ret += "<option value=\"" + row2.budget_year + "\">" + row2.budget_year + "</option>";
			}
			ret += "</select><br />";

			ret += "Mail: <select name =\"mail\"><br />";
			for(j = 0; j < examiners.rowCount; j++){
				var row2 = examiners.rows[j];
				ret += "<option value=\"" + row2.mail + "\">" + row2.mail + "</option>";
			}
			ret += "</select><br /><br />";
			ret += "Tutoring hours <br /><input type=\"text\" name=\"hours\"> <br /><br />";
			ret += "<input type=\"submit\" name=\"submit\" value=\"Submit\">";
			ret += "</form>";
			ret += "\n</div>\n</div>";

			callback(ret);
		});
	});
}


module.exports = {
	directors,
	specify_tutoring_hours,
	examiners,
	profile,
	degree_projects,
	get_degree_project,
	available_examiners,
	budget_years
};