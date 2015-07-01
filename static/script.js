/*
TODO:
- Retrieve metadata button
- Get Thumbnail/name of video for dialog
- CSS Setup
*/

// Global variables
var metadataList = [];
var songNum = -1;
var currentForm = -1;

$(document).ready(function() {			
	setupPage();
});

// ***** SETUP FUNCTIONS *****

// Main set up function
function setupPage(){
	setupDialogs();
	setupDownloadButton();
	setupAddButton();
	setupConfigButton();
	$.get('/static/genres', function(data){
		var genreList = data.split('||');
		fillDropdown("#genre", genreList);
	});
	addForm();
}

// Sets up a download button with event
function setupDownloadButton(){
	$(document).on("click", '#downloadButton:not(.disabled)', function() {
		var downloadQueue = downloadSongs();

		// Runs when everything is done
		$.when.apply(null, downloadQueue).done(function(){
			disableButtons(false);
			alert('All Downloads finished');
		});		
	}); 
}

// Sets up a button to add forms
function setupAddButton(){
	$(document).on("click", "#addFormButton:not(.disabled)", function() {
		addForm();
	});
}

// Sets up the config button
function setupConfigButton(){
	$(document).on("click", "#configButton:not(.disabled)", function() {
		$("#configDialog").dialog("open");
	});
}

// Sets up the dialog
function setupDialogs(){
	// Dialog pop up code
	$(function() {
		$("#formDialog").dialog({
			autoOpen: false,
			modal: true,
			buttons: {
				"Done": function() {
					dialogCloseButtonClick();
					$(this).dialog("close");	
				}
			}
		});
	});
	
	// Dialog pop up code
	$(function() {
		$("#configDialog").dialog({
			autoOpen: false,
			modal: true,
			buttons: {
				"Apply": function() {
					saveConfig();
				}
			}
		});
	});
	
	// Fill settings from server
	populateConfigDialog();
}

// Generic dropdown fill
function fillDropdown(id, values, selected) {
	for(var i =  0; i < values.length; i++){
		$(id).append("<option" + (values[i] == selected? ' selected' : '') + ">"+values[i]+"</option>");	
	}
}

// Runs when the Dialog's "Done" button is clicked
function dialogCloseButtonClick(){
	saveFieldsToJSON(currentForm);
}

// ***** DOWNLOAD FUNCTIONS *****

// Runs AJAX to download songs to server
// They will download simultaneously
function downloadSongs() {
	// Resetting and disabling UI
	$("#songDiv .urlForm").css('background-color', 'white'); // Reset colors of all the forms
	disableButtons(true);

	var downloadQueue = [];
	for(var i = 0; i <= songNum; i++){
		(function(index){
			var form = $("#songDiv .songForm").eq(index).find(".urlForm");
			form.css('background-color', '#FFF9BA'); // highlight the currently downloading form
			var url = form.val();
			if(url == "") return; // URL is absolutely required, if it's not present then move on.
			// Otherwise, if url is present, but no metadata, then send in the url with empty data
			if(metadataList[index] != undefined){
				metadataList[index]["Url"] = url;
			} else {
				metadataList[index]= {"Url":url, "Artist":"", "Title":"", "Album":"", "Genre":"", "Year":"" };
			}
			downloadQueue.push($.ajax({
					type: "POST",
					url: "/download",
					data: JSON.stringify(metadataList[index]),
					contentType: 'application/json',
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
					finishedDownload(false, form, textStatus + " - " + errorThrown);
				})
				.done(function(data) {
					finishedDownload(data["Success"], form, data["Message"]);
				})
			);
		})(i);
	}
	return downloadQueue;
}

// Runs when a download is successful or failed
function finishedDownload(success, form, msg) {
	form.css('background-color', success? "green" : "red");
}

// ***** FORM FUNCTIONS *****

// Adds a form to the page
function addForm(){
	songNum++;
	var form = '<div class="songForm">'+
					'<input type="text" class="urlForm"/>'+
					'<div class="button" id="metadataBtn">i</div>'+
					'<div class="button" id="closeBtn">x</div>'+
				'</div>';
	$("#songDiv").append(form);
	
	// Click event for opening dialog
	$("#songDiv .songForm").eq(songNum).on("click", "#metadataBtn:not(.disabled)", function() {
		currentForm = $(this).parent().index();
		populateFieldsFromJSON(currentForm);
		setThumbnail($(this).parent().find(".urlForm").val());
		$("#formDialog").dialog("open");
	});
	
	// Click event for close button
	$("#songDiv .songForm").eq(songNum).on("click", "#closeBtn:not(.disabled)", function() {
		index = $("#songDiv .songForm").index($(this).parent());
		metadataList.splice(index, 1);
		$(this).parent().remove();
		songNum--;
	});
}

// Saves dialog forms to JSON a JSON object
function saveFieldsToJSON(n) {
	var downloadObj = {
		"Artist": $("#artist").val(),
		"Title": $("#songtitle").val(),
		"Album": $("#album").val(), 
		"Genre": $("#genre").val(), 
		"Year": $("#yearRelease").val()
	};
	metadataList[n] = downloadObj;
}

// Populates dialog forms from a JSON object, or gives default values
function populateFieldsFromJSON(n){
	var jsonObj = metadataList[n];
	if(jsonObj != undefined){
		$("#artist").val(jsonObj["Artist"]);
		$("#songtitle").val(jsonObj["Title"]);
		$("#album").val(jsonObj["Album"]);
		$("#genre").val(jsonObj["Genre"]);
		$("#yearRelease").val(jsonObj["Year"]);
	} else {
		$("#artist").val("");
		$("#songtitle").val("");
		$("#album").val("");
		$("#genre").val("");
		$("#yearRelease").val("");
	}
}

function disableButtons(disabling){
	$('#mainDiv .button').toggleClass('disabled', disabling);
}

// ***** UTILITY FUNCTIONS *****

// Get the key of the video
function getKey(url) {
	return url.match(/youtube\.com.*(\?v=|\/embed\/)(.{11})/).pop();
}

// Set a video thumbnail in the dialog, or hide the image if nothing can be found
function setThumbnail(url){
	var imgUrl = "";
	if(url.match(/youtube/) != null){
		imgUrl = "http://img.youtube.com/vi/" + getKey(url) + "/0.jpg";
	}
	if(imgUrl != ""){
		$("#formDialog img").show();
		$("#formDialog img").attr("src", imgUrl);
	} else {
		$("#formDialog img").hide();
	}
}

function processString(str){
	str = str.replace( new RegExp(/"/g), "");
	str = str.toLowerCase();
	return str;
}

function populateConfigDialog(){
	$('#pathNotFound').hide();
	$.getJSON('/config', function( data ) {
		$.each( $.parseJSON(data), function( key, val ) {
			if( $('#' + key).length ){
				pVal = processString(val);
				if(pVal == "false" || pVal == "true"){
					$('#' + key).attr('checked', pVal == 'true' ? true : false);
				} else {
					$('#' + key).val(pVal);
				}
			} else if (key == 'supported_formats'){
				fillDropdown("#format", val, processString($.parseJSON(data)['format']));
			}
		});
	});
}

function saveConfig(){
	jsonObj = {}
	$("#configDialog input, #configDialog select").each( function(key, value) {
		if(this.type != "checkbox") {
			jsonObj[$(this).attr('id')] = this.value;
		} else {
			jsonObj[$(this).attr('id')] = $(this).is(':checked');
		}
	});

	$.ajax({
		type: "POST",
		url: "/config",
		data: JSON.stringify(jsonObj),
		contentType: 'application/json',
		dataType: "json",
		success: function (data) {
			// If path isn't found, let the user know
			var pathFound = $.parseJSON(data).found_path;
			if(pathFound) $('#pathNotFound').hide();
			else $('#pathNotFound').show();
		}
	});
}