var downloadObj2 = [{"Url" : "https://www.youtube.com/watch?v=a5uQMwRMHcs", "Title" : "Instant Crush", "Artist" : "Daft Punk", "Genre": "Electronic", "Year" : 2013, "Album" : "Random Access Memories"}, { "Url" : "https://www.youtube.com/watch?v=KT59sFCmVcs", "Title" : "Big Day for the Little People", "Artist" : "Godforbid and Thirtyseven", "Genre" : "Hip-hop", "Year" : 2007, "Album" : ""}];
var download2 = {"Url" : "https://www.youtube.com/watch?v=HM_PFEZTdTQ", "Title" : "Little Booty Girl", "Artist" : "Thunderheist", "Genre": "Hip-hop","Year" : 2008, "Album" : ""};

var downloadList = {};
var songNum = 2;
var currentForm = 1;

/*
TODO:
- Dynamically generate forms
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

$(document).ready(function() {			
	setupDialog();
	setupDownloadButton();
});

function downloadSongs() {
	// This will download asynchronously
	for(var i = 1; i <= songNum; i++){
		$.ajax({
			type: "POST",
			url: "/download",
			data: JSON.stringify(downloadList["song" + i]),
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

function finishedDownload(success, msg) {
	alert(msg);
}

function setupDownloadButton(){
	$("#download").click(function(e) {
		downloadSongs();
	}); 
}

function setupDialog(){
	// Dialog pop up code
	$(function() {
		$("#dialog").dialog({
			autoOpen: false,
			modal: true,
			dialogClass: "dlg-no-title",
			buttons: {
				"Dismiss": function() {
					saveFieldsToJSON(currentForm);
					$(this).dialog("close");
				}
			}
		});
	});
	
	// Click event for opening dialog
	$(".songBtn").on("click", function() {
		currentForm = this.id;
		populateFieldsFromJSON(currentForm);
		$("#dialog").dialog("open");
	}); 
}

function saveFieldsToJSON(n) {
	var downloadObj = {
		"Url": $("#" + n + ".urlForm").val(), 
		"Artist": $("#artist").val(), 
		"Title": $("#title").val(), 
		"Album": $("#album").val(), 
		"Genre": $("#genre").val(), 
		"Year": $("#year").val()
	};
	downloadList["song" + n] = downloadObj;
}

function populateFieldsFromJSON(n){
	var jsonObj = downloadList["song" + n];
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

