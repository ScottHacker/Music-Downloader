var downloadObj2 = [{"Url" : "https://www.youtube.com/watch?v=a5uQMwRMHcs", "Title" : "Instant Crush", "Artist" : "Daft Punk", "Genre": "Electronic", "Year" : 2013, "Album" : "Random Access Memories"}, { "Url" : "https://www.youtube.com/watch?v=KT59sFCmVcs", "Title" : "Big Day for the Little People", "Artist" : "Godforbid and Thirtyseven", "Genre" : "Hip-hop", "Year" : 2007, "Album" : ""}];
var download2 = {"Url" : "https://www.youtube.com/watch?v=HM_PFEZTdTQ", "Title" : "Little Booty Girl", "Artist" : "Thunderheist", "Genre": "Hip-hop","Year" : 2008, "Album" : ""};

downloadList = {};

/*
TODO:
- Receive URL from Form
- Receive Metadata from popup window Form
- Send user-input URL and metadata to server
- Send each download request individually
*/

$(document).ready(function() {	

	// AJAX to webserver
	$("#download").click(function(e) {
		$.ajax({
			type: "POST",
			url: "/download",
			data: JSON.stringify(downloadList["1"]),
			contentType: 'application/json',
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			alert(textStatus + " - " + errorThrown);
		})
		.done(function() {
			alert("Download finished");
		});
	});
	
	// Dialog pop up code
	$(function() {
		$("#dialog").dialog({
			autoOpen: false,
			modal: true,
			dialogClass: "dlg-no-title",
			buttons: {
				"Dismiss": function() {
					saveFieldsToJSON();
					$(this).dialog("close");
				}
			}
		});
		$("#metadata").on("click", function() {
			$("#dialog").dialog("open");
		});
	});
	
	function saveFieldsToJSON() {
		var downloadObj = {
							"Url": $("#url").val(), 
							"Artist": $("#artist").val(), 
							"Title": $("#title").val(), 
							"Album": $("#album").val(), 
							"Genre": $("#genre").val(), 
							"Year": $("#year").val()
						  };
		// Needs a proper form identification
		downloadList["1"] = downloadObj;
	}
});