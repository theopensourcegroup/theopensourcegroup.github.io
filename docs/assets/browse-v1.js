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
	var filter_tags = url.replace(/.*tags=/, "");
	var filter_tags = filter_tags.replace(/&.*/, "");
	var filter_tags = filter_tags.replace(/=.*/, "");
	var filter_tags = filter_tags.replace(/\+/g, " ");
	if (url.includes("tags=") === false) {
		var filter_tags = '';
	}
	var filter_types = url.replace(/.*types=/, "");
	var filter_types = filter_types.replace(/&.*/, "");
	var filter_types = filter_types.replace(/=.*/, "");
	if (url.includes("types=") === false) {
		var filter_types = 'post,resource';
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
document.body.onload = create_content_list(filter_quantity, filter_page_number, filter_keywords, filter_tags, filter_types);
	function create_content_list (quantity, page_number, keywords, tags, types) {
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
		//Filter list (starting from the offset, find the first $quantity results which contain the keywords, and match any of the selected types)
		window.database_results = '';
		database.forEach(check_keywords_and_types);
		function check_keywords_and_types(item, index) {
			///Split line by | symbol to get an array of 4 values (title, url, type, tags)
			var items = item.split('|');
			var checks = true;
			///Check type
			var filter_types_array = filter_types.split(',');
			var item_type = items[2];
			if (filter_types_array.includes(item_type) === true){
				if (checks === true){
					var checks = true;
				} else {
					var checks = false;
				}
			} else {
				var checks = false;
			}
			///Check keywords
			var filter_keywords_array = filter_keywords.toLowerCase().split(',');
			var item_keywords = items[0].toLowerCase().split(' ');
			////Foreach filter keyword check if it is in item keywords. If any are missing checks is false.
			var checks2 = true;
			filter_keywords_array.forEach(check_keywords);
			function check_keywords(sub_item, sub_index){
				if (item_keywords.includes(sub_item) === true){
					//window.checks = true;
				} else {
					checks2 = false;
				}
			}
			////Fix: If there are no keywords (eg: empty search) this will allow all entries to match
			if (checks2 === false){
				if (filter_keywords_array[0].length == 0){
					checks2 = true;
				}
			}
			///Check tags. Each database entry must contain any of the filter tags. If there are no filter tags there's no need to check. If there are no matches then $checks needs to be false, because the entry is not usuable
			//console.log(items);
			var filter_tags_array = filter_tags.toLowerCase().split(',');
			if (item.length < 1){
				var item_tags = [];
			} else {
				var item_tags = items[3].toLowerCase().split(',');
			}
			var checks3 = true;
			if (filter_tags_array[0] !== ''){
				window.matching_tags_count = 0;
				filter_tags_array.forEach(check_tags);
				function check_tags(item, index) {
					if (item_tags.includes(item) == true){
						window.matching_tags_count++;
					}
				}
				if (window.matching_tags_count < 1) {
					checks3 = false;
				}
			}
			
			///If useable add to global database_results array
			if (checks === true && checks2 === true && checks3 === true){
				window.database_results += item;
				window.database_results += "\n"
			}
		}
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
			///Split line by | symbol to get an array of 3 values (title, url, and type)
			var items = item.split('|');
			///Create link
			var entry_link = document.createElement("a");
			entry_link.className = "entry_link";
			entry_link.setAttribute('href', items[1]);
			entry_link.innerHTML = items[0];
			///Add to DOM
			document.getElementById('content').appendChild(entry_link);
			///Create div to list type
			var entry_type = document.createElement("div");
			entry_type.className = "entry_type";
			entry_type.innerHTML = items[2];
			///Add to DOM
			document.getElementById('content').appendChild(entry_type);
			///Create div to divide entries
			var entry_break = document.createElement("div");
			entry_break.className = "entry_break";
			entry_break.innerHTML = '';
			///Add to DOM
			document.getElementById('content').appendChild(entry_break);
		}
		//Create buttons for navigating to previous (if applicable), and next offset
		///Create previous button
		if (page_number > 1) {
			var previous_page_number = page_number - 1;
			var url_previous_button = '/index.html' + '?keywords=' + keywords + '&tags=' + tags + '&types=' + types + '&page=' + previous_page_number + '&quantity=' + quantity;
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
			var url_next_button = '/index.html' + '?keywords=' + keywords + '&tags=' + tags + '&types=' + types + '&page=' + next_page_number + '&quantity=' + quantity;
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
