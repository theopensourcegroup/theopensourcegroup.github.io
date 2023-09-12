//Fetch database
window.database_file_path = '/databases/content.txt';
var database_contents = '';
var file_contents = new XMLHttpRequest();
file_contents.onload = function(){
	window.database_contents = this.responseText;
	//Get filters (e.g., keywords, tags, content types, page_number, quantity) from url parameters. Or set default values.
	var url = window.location.href;
	var url = decodeURIComponent(url);
	var filter_keywords = url.replace(/.*keywords=/, "");
	var filter_keywords = filter_keywords.replace(/&.*/, "");
	var filter_keywords = filter_keywords.replace(/=.*/, "");
	if (url.includes("keywords=") === false) {
		var filter_keywords = '';
	}
	var filter_page_number = url.replace(/.*page=/, "");
	var filter_page_number = filter_page_number.replace(/&.*/, "");
	var filter_page_number = filter_page_number.replace(/=.*/, "");
	if (url.includes("page=") === false) {
		var filter_page_number = '1';
	}
	var filter_quantity = url.replace(/.*quantity=/, "");
	var filter_quantity = filter_quantity.replace(/&.*/, "");
	var filter_quantity = filter_quantity.replace(/=.*/, "");
	if (url.includes("quantity=") === false) {
		var filter_quantity = '12';
	}
	//Generate a list of results, and buttons to go to previous/next page
document.body.onload = create_content_list(filter_quantity, filter_page_number, filter_keywords);
	function create_content_list (quantity, page_number, keywords) {
		//Create list
		const content_list = document.createElement("div");
		//Add class
		content_list.className = "content_list";
		//Add ID
		content_list.id = 'content_list'
		//Add content_list to DOM
		const selected_element = document.getElementById("content");
		document.body.insertBefore(content_list, selected_element);
		var database = window.database_contents.split('\n');
		//Filter list (starting from the offset, find the first $quantity results which contain any of the keywords)
		window.database_results = '';
		database.forEach(check_keywords_and_types);
		function check_keywords_and_types(item, index) {
			///Split line by | symbol to get an array of values (title, url, type, tags, etc)
			var items = item.split('|');
			var checks = true;
			///Check keywords
			var filter_keywords_array = filter_keywords.toLowerCase().split(',');
			var item_keywords = items[0].toLowerCase().split(' ');
			////Foreach filter keyword check if it is in item keywords. If NONE are present checks is false. Otherwise assign a match score.
			var checks2 = true;
			var match_score = 0;
			filter_keywords_array.forEach(check_keywords);
			function check_keywords(sub_item, sub_index){
				if (item_keywords.includes(sub_item) === true){
					match_score++;
				} else {
					//checks2 = false;
				}
			}
			
			var match_total = filter_keywords_array.length;
			match_total = match_score / match_total;
			match_total = match_total * 100;
			match_total = Math.round(match_total);
			
			if (match_score == 0) {
				checks2 = false;
			}
			////Fix: If there are no keywords (eg: empty search) this will allow all entries to match
			if (checks2 === false){
				if (filter_keywords_array[0].length == 0){
					checks2 = true;
				}
			}
			
			///If useable add to global database_results array
			if (checks === true && checks2 === true){
				window.database_results += item + '|' + match_total;
				window.database_results += "\n";
			}
		}
		
		
		///Sort the database by match % (aka alphabetical?)
		var match_database_0_25 = '';
		window.match_database_0_25 = match_database_0_25;
		var match_database_25_50 = '';
		window.match_database_25_50 = match_database_25_50;
		var match_database_50_75 = '';
		window.match_database_50_75 = match_database_50_75;
		var match_database_75_100 = '';
		window.match_database_75_100 = match_database_75_100;
		var database_results_2 = window.database_results.split('\n');
		database_results_2.forEach(sort_by_match_score);
		function sort_by_match_score(item, index) {
			///Split line by | symbol to get an array of values (title, url, type, tags, etc)
			var items = item.split('|');
			if (parseInt(items[6]) < 25) {
				window.match_database_0_25 += item;
				window.match_database_0_25 += "\n";
			} else if (parseInt(items[6]) < 50) {
				window.match_database_25_50 += item;
				window.match_database_25_50 += "\n";
			} else if (parseInt(items[6]) < 75) {
				window.match_database_50_75 += item;
				window.match_database_50_75 += "\n";
			} else if (parseInt(items[6]) > 75) {
				window.match_database_75_100 += item;
				window.match_database_75_100 += "\n";
			} else {
			  //Error. All items should be sorted.
			}
		}
		window.database_results = '';
		if (window.match_database_75_100 != '') {
			window.database_results += window.match_database_75_100;
		}
		if (window.match_database_50_75 != '') {
	   	window.database_results += window.match_database_50_75;
		}
		if (window.match_database_25_50 != '') {
			window.database_results += window.match_database_25_50;
		}
		if (window.match_database_0_25 != '') {
			window.database_results += window.match_database_0_25;
		}
		//console.log(window.database_results);
		
		///Reduce list to specific offset, and quantity
		if (filter_page_number === '1'){
			var database_selection_point_1 = 0;
			var database_selection_point_2 = parseInt(filter_quantity);
		} else {
			var database_selection_point_1 = parseInt(filter_page_number) - 1;
			var database_selection_point_1 = database_selection_point_1 * parseInt(filter_quantity);
		}
		var database_selection_point_2 = parseInt(filter_quantity) * parseInt(filter_page_number);
		var database_portion = window.database_results.split('\n').slice(database_selection_point_1, database_selection_point_2);
		database_portion.reverse();
		if (database_portion[0] === ''){
			database_portion.shift();
		}
		database_portion.reverse();
		//Generate a list entry for each item
		database_portion.forEach(create_entries);
		function create_entries(item, index) {
			///Determine entry number
			var entries = document.getElementsByClassName("entry_holder");
			var n_entries = entries.length;
			n_entries++;
			///Split line by | symbol to get an array of 5 values (title, url, type, tags, thumbnail url, and description url). Keep in mind that tags, thumbnails, and descriptions may be empty.
			var items = item.split('|');
			///Create div to hold entry
			var entry_holder = document.createElement("div");
			entry_holder.className = "entry_holder";
			entry_holder_id = 'entry_holder_';
			entry_holder_id = entry_holder_id.concat(n_entries);
			entry_holder.id = entry_holder_id;
			///Add to DOM
			document.getElementById('content').appendChild(entry_holder);
			
			///Create thumbnail
			if (items[4] != '') {
				var entry_thumbnail = document.createElement("IMG");
				entry_thumbnail.setAttribute('src', items[4]);
				entry_thumbnail.className = "entry_thumbnail";
				entry_thumbnail_id = 'entry_thumbnail_';
				entry_thumbnail_id = entry_thumbnail_id.concat(n_entries);
				entry_thumbnail.id = entry_thumbnail_id;
				///Add to DOM
				document.getElementById(entry_holder_id).appendChild(entry_thumbnail);
			}
			
			///Create subholder
			var entry_subholder = document.createElement("div");
			entry_subholder.className = "entry_subholder";
			entry_subholder_id = 'entry_subholder_';
			entry_subholder_id = entry_subholder_id.concat(n_entries);
			entry_subholder.id = entry_subholder_id;
			///Add to DOM
			document.getElementById(entry_holder_id).appendChild(entry_subholder);
			
			///Create div to list match total
			if (items[6] != 0) {
				var entry_match = document.createElement("div");
				entry_match.className = "entry_match";
				if (parseInt(items[6]) < 25) {
					entry_match.className += " entry_match_low";
				} else if (parseInt(items[6]) < 50) {
					entry_match.className += " entry_match_low";
				} else if (parseInt(items[6]) < 75) {
					entry_match.className += " entry_match_medium";
				} else if (parseInt(items[6]) > 75) {
					entry_match.className += " entry_match_high";
				}
				entry_match.innerHTML = items[6] + '% match to search input.';
				///Add to DOM
				document.getElementById(entry_subholder_id).appendChild(entry_match);
			}
			
			///Create link
			var entry_link = document.createElement("a");
			entry_link.className = "entry_link";
			entry_link.setAttribute('href', items[1]);
			////Make resource links open in a new tab, or window
			if (items[2] == 'resource') {
				entry_link.target = '_blank';
			}
			entry_link.innerHTML = items[0];
			///Add to DOM
			document.getElementById(entry_subholder_id).appendChild(entry_link);
			
			///Create div to list type
			var entry_type = document.createElement("div");
			entry_type.className = "entry_type";
			entry_type.innerHTML = items[2];
			///Add to DOM
			document.getElementById(entry_subholder_id).appendChild(entry_type);
			
			///Create div to list description
			if (items[5] != '') {
				var entry_description = document.createElement("div");
				entry_description.className = "entry_description";
				window.file1_path = items[5];
				var file_contents1 = new XMLHttpRequest();
				file_contents1.onload = function(){
					entry_description.innerHTML = this.responseText;
				}
				file_contents1.open("GET", window.file1_path, true);
				file_contents1.responseType = 'text';
				file_contents1.send();
				///Add to DOM
				document.getElementById(entry_subholder_id).appendChild(entry_description);
			}
			
			///Create div to list tags
			if (items[3] != '') {
				var entry_tags = document.createElement("div");
				entry_tags.className = "entry_tags";
				entry_tags_id = 'entry_tags_';
				entry_tags_id = entry_tags_id.concat(n_entries);
				entry_tags.id = entry_tags_id;
				///Add to DOM
				document.getElementById(entry_subholder_id).appendChild(entry_tags);
				var entry_tags_label = document.createElement("div");
				entry_tags_label.className = "entry_tags_label";
				entry_tags_label.innerHTML = 'Tags: ';
				document.getElementById(entry_tags_id).appendChild(entry_tags_label);
				var entry_tags_items = items[3].split(',');
				entry_tags_items.forEach(create_separate_tags);
				function create_separate_tags(item, index) {
					var entry_tag = document.createElement("div");
					entry_tag.className = "entry_tag";
					entry_tag.innerHTML = item;
					document.getElementById(entry_tags_id).appendChild(entry_tag);
				}
			}
			
			///Create div to divide entries
			var entry_break = document.createElement("div");
			entry_break.className = "entry_break";
			entry_break.innerHTML = '';
			///Add to DOM
			document.getElementById('content').appendChild(entry_break);
		}
		//If there are no search results, add a message.
		if (window.database_results == '') {
			var search_message = document.createElement("div");
			search_message.className = "search_message";
			search_message.innerHTML = 'Oh no! Your search did not return any results. Rephrasing may help.';
			///Add to DOM
			document.getElementById('content').appendChild(search_message);
		}
		
		//Create buttons for navigating to previous (if applicable), and next offset
		///Create previous button
		if (page_number > 1) {
			var previous_page_number = page_number - 1;
			var url_previous_button = '/search.html' + '?keywords=' + keywords + '&page=' + previous_page_number + '&quantity=' + quantity;
			var button_previous_button = document.createElement("a");
			button_previous_button.className = "button_previous_button";
			button_previous_button.setAttribute('href', url_previous_button);
			button_previous_button.innerHTML = 'Previous';
			///Add to DOM
			document.getElementById('content').appendChild(button_previous_button);
		}
		///Create next button
		if (database_portion.length < quantity) {
			//Do nothing
		} else {
			var next_page_number = page_number;
			next_page_number++;
			var url_next_button = '/search.html' + '?keywords=' + keywords + '&page=' + next_page_number + '&quantity=' + quantity;
			var button_next_button = document.createElement("a");
			button_next_button.className = "button_next_button";
			button_next_button.setAttribute('href', url_next_button);
			button_next_button.innerHTML = 'Next';
			///Add to DOM
			document.getElementById('content').appendChild(button_next_button);
		}
	}
}
file_contents.open("GET", window.database_file_path, true);
file_contents.responseType = 'text';
file_contents.send();
