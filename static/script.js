/*
TODO:
- Check path, If path doesn't exist let the user know
- Disable "Run Download" button while server is rebooting after new settings.
- Retrieve metadata button
- Get Thumbnail/name of video for dialog
- Download status feedback (percentage?)
- Get Default selected dropdown working
- CSS Setup
*/

// List of Genres for Metadata
var genres = ['Blues', 'Classic Rock', 'Country', 'Dance', 'Disco', 'Funk', 'Grunge', 'Hip-Hop', 'Jazz', 'Metal', 'New Age', 'Oldies',
			  'Other', 'Pop', 'Rhythm and Blues', 'Rap', 'Reggae', 'Rock', 'Techno', 'Industrial'];

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
	fillDropdown("#genre", genres);
	addForm();
}

// Sets up a download button with event
function setupDownloadButton(){
	$("#downloadButton").click(function() {
		downloadSongs();
	}); 
}

// Sets up a button to add forms
function setupAddButton(){
	$("#addFormButton").click(function() {
		addForm();
	});
}

// Sets up the config button
function setupConfigButton(){
	$("#configButton").click(function() {
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
function fillDropdown(id, values) {
	for(var i =  0; i < values.length; i++){
		$(id).append("<option>"+values[i]+"</option>");	
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
	for(var i = 0; i <= songNum; i++){
		var url = $("#songDiv .songForm").eq(i).find(".urlForm").val();
		if(url == "") continue; // URL is absolutely required, if it's not present then move on.
		// Otherwise, if url is present, but no metadata, then send in the url with empty data
		if(metadataList[i] != undefined){
			metadataList[i]["Url"] = url;
		} else {
			metadataList[i]= {"Url":url, "Artist":"", "Title":"", "Album":"", "Genre":"", "Year":"" };
		}
		$.ajax({
			type: "POST",
			url: "/download",
			data: JSON.stringify(metadataList[i]),
			contentType: 'application/json',
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			finishedDownload(false, textStatus + " - " + errorThrown);
		})
		.done(function() {
			finishedDownload(true, "Download finished");
		});
	}
}

// Runs when a download is successful or failed
function finishedDownload(success, msg) {
	alert(msg);
}

// ***** FORM FUNCTIONS *****

// Adds a form to the page
function addForm(){
	songNum++;
	var form = '<div class="songForm">'+
					'<input type="text" class="urlForm"/>'+
					'<button class="metadataBtn">i</button>'+
					'<button class="closeBtn">x</button>'+
				'</div>';
	$("#songDiv").append(form);
	
	// Click event for opening dialog
	$("#songDiv .songForm").eq(songNum).find(".metadataBtn").on("click", function() {
		currentForm = $(this).parent().index();
		populateFieldsFromJSON(currentForm);
		setThumbnail($(this).parent().find(".urlForm").val());
		$("#formDialog").dialog("open");
	});
	
	// Click event for close button
	$("#songDiv .songForm").eq(songNum).find(".closeBtn").on("click", function() {
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
		"Title": $("#title").val(),
		"Album": $("#album").val(), 
		"Genre": $("#genre").val(), 
		"Year": $("#year").val()
	};
	metadataList[n] = downloadObj;
}

// Populates dialog forms from a JSON object, or gives default values
function populateFieldsFromJSON(n){
	var jsonObj = metadataList[n];
	if(jsonObj != undefined){
		$("#artist").val(jsonObj["Artist"]);
		$("#title").val(jsonObj["Title"]);
		$("#album").val(jsonObj["Album"]);
		$("#genre").val(jsonObj["Genre"]);
		$("#year").val(jsonObj["Year"]);
	} else {
		$("#artist").val("");
		$("#title").val("");
		$("#album").val("");
		$("#genre").val("");
		$("#year").val("");
	}
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
		$("#formDialog img").css('display', 'block');
		$("#formDialog img").attr("src", imgUrl);
	} else {
		$("#formDialog img").css('display', 'none');
	}
}

function processString(str){
	str = str.replace( new RegExp(/"/g), "");
	str = str.toLowerCase();
	return str;
}

function populateConfigDialog(){
	$('#pathNotFound').css('display','none');
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
				fillDropdown("#format", val);
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
			$('#pathNotFound').css('display', pathFound? 'none' : 'block');
		}
	});
}