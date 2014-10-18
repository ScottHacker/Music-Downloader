/*
TODO:
- Retrieve metadata button
- Get Thumbnail/name of video for dialog
- Download status feedback (percentage?)
- Settings Dialog
-- File Name Format
-- Save location
-- Turn spaces to underscores
-- Save settings to file on server
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
	setupDialog();
	setupDownloadButton();
	setupAddButton();
	setupGenres();
	addForm();
}

// Sets up a download button with event
function setupDownloadButton(){
	$("#download").click(function() {
		downloadSongs();
	}); 
}

// Sets up a button to add forms
function setupAddButton(){
	$("#addFormButton").click(function() {
		addForm();
	});
}

// Sets up the dialog
function setupDialog(){
	// Dialog pop up code
	$(function() {
		$("#dialog").dialog({
			autoOpen: false,
			modal: true,
			dialogClass: "dlg-no-title",
			buttons: {
				"Done": function() {
					dialogCloseButtonClick();
					$(this).dialog("close");	
				}
			}
		});
	});
}

// Adds genres to dialog drop down
function setupGenres(){
	for(var i = 0; i < genres.length; i++){
		$("#genre").append("<option>"+genres[i]+"</option>");
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
			data: JSON.stringify(metadataList[n]),
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
		$("#dialog").dialog("open");
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
		$("#dialog img").css('display', 'block');
		$("#dialog img").attr("src", imgUrl);
	} else {
		$("#dialog img").css('display', 'none');
	}
}