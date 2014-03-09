/**
 * mappedcontactformpro.js 
 * main javascript file of mapped contact form pro
 * a professional google maps contact form from autobahn81.com
 */

/**
 * Namespace. A helper for reating namespaces in javascript.
 */
var Namespace =
{
    Register : function(_Name)
    {
        var chk = false;
        var cob = "";
        var spc = _Name.split(".");
        for(var i = 0; i<spc.length; i++)
        {
            if(cob!=""){cob+=".";}
            cob+=spc[i];
            chk = this.Exists(cob);
            if(!chk){this.Create(cob);}
        }
        if(chk){ throw "Namespace: " + _Name + " is already defined."; }
    },

    Create : function(_Src)
    {
        eval("window." + _Src + " = new Object();");
    },

    Exists : function(_Src)
    {
        eval("var NE = false; try{if(" + _Src + "){NE = true;}else{NE = false;}}catch(err){NE=false;}");
        return NE;
    }
}

/**
  * add the travel map pro namespace
  */
Namespace.Register("mappedContactForm"); 

/**
 * helper to store the markers to make them available from html
 */
mappedContactForm.markers = new Array();

/**
 * initalizes the map with markers and polyline on onload
 */
mappedContactForm.initialize = function(){
	// map options
    var myOptions = {
        zoom: mappedContactForm.mapZoom,
        center: new google.maps.LatLng(mappedContactForm.mapCenter[0], mappedContactForm.mapCenter[1]),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
	// map options end
	
	// init map with options
    var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

    // init infowindow
    var infowindow = new google.maps.InfoWindow();

	//helper function for handling multiple infowindows
    function myInfoWindow(mymarker) {
        infowindow.close();
        infowindow.setPosition(mymarker.getPosition());
        infowindow.setContent(mymarker.infoContent);
        infowindow.open(map);
		mappedContactForm.validate();
    }

    // helper function to close opend infowindows
    closeinfowindow = function() {
        infowindow.close();
    };

	// close opened infowindows by click on the map
    google.maps.event.addListener(map, 'click', closeinfowindow);
	
	//iterate over all locations
    for (var i = 0; i < mappedContactForm.locations.length; i++) {
        var stop = mappedContactForm.locations[i];//get stop from locations array
        var myLatLng = new google.maps.LatLng(stop[1], stop[2]);//get lat and lng from stop
		
		//add marker for stop
        var marker = new google.maps.Marker({
            position: myLatLng,
            shadow: mappedContactForm.shadowImage(),
            icon: mappedContactForm.markerImage(stop[3]),//get image for this marker
            shape: mappedContactForm.markerShape(),
            title: stop[0],
            zIndex: i
        });
		//add marker for stop end
        marker.infoContent = mappedContactForm.infoWindowHtml(stop[0], stop[4]);//add info window content to marker
        marker.setMap(map); //draw marker on the map
						
		//add listener to marker
        google.maps.event.addListener(marker, mappedContactForm.listener,
        function() {
            myInfoWindow(this);
        });
		//open info when only on marker is on the map

		mappedContactForm.markers.push(marker);
		if (mappedContactForm.locations.length == 1){
		  //google.maps.event.trigger(marker, mappedContactForm.listener); 			
		  //mappedContactForm.validate();
			google.maps.event.trigger(marker, mappedContactForm.listener,
        	function() {
        	    mappedContactForm.validate();
        	});
		}
    }
// Create the search box and link it to the UI element.
  var input = /** @type {HTMLInputElement} */(
      document.getElementById('pac-input'));
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  var searchBox = new google.maps.places.SearchBox(
    /** @type {HTMLInputElement} */(input));

  // Listen for the event fired when the user selects an item from the
  // pick list. Retrieve the matching places for that item.
  google.maps.event.addListener(searchBox, 'places_changed', function() {
    var places = searchBox.getPlaces();

    for (var i = 0, marker; marker = markers[i]; i++) {
      marker.setMap(null);
    }

    // For each place, get the icon, place name, and location.
    markers = [];
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0, place; place = places[i]; i++) {
      var image = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      var marker = new google.maps.Marker({
        map: map,
        icon: image,
        title: place.name,
        position: place.geometry.location
      });

      markers.push(marker);

      bounds.extend(place.geometry.location);
    }

    map.fitBounds(bounds);
  });

  // Bias the SearchBox results towards places that are within the bounds of the
  // current map's viewport.
  google.maps.event.addListener(map, 'bounds_changed', function() {
    var bounds = map.getBounds();
    searchBox.setBounds(bounds);
  });
}

/*
 * Image for marker
 * return start marker if location is the first stop
 * return end marker if the location is the last stop
 */
mappedContactForm.markerImage = function(picture){
	return new google.maps.MarkerImage(
		'buildings/' + picture +  '.png',
    	// This marker is 36 pixels wide by 38 pixels tall.
    	new google.maps.Size(36, 38),
    	// The origin for this image is 0,0.
    	new google.maps.Point(0, 0),
    	// The anchor for this image is the base of the flagpole at 18,38.
    	new google.maps.Point(18, 38)
    );
}

/*
 * Image for marker shadow
 */
mappedContactForm.shadowImage = function(){
	return new google.maps.MarkerImage('buildings/shadow.png',
    	new google.maps.Size(36, 38),
    	new google.maps.Point(0, 0),
    	new google.maps.Point(0, 38)
	);
}

/* 
 * Image map region definition used for drag/click.
 */
mappedContactForm.markerShape = function(){
    var shape = {
        coord: [1, 1, 1, 20, 18, 20, 18, 1],
        type: 'poly'
    };	
}

/**
 * infoWindowHtml returns the html5 contact form that is shown in the infoWindows for each marker
 */
mappedContactForm.infoWindowHtml = function(name, email){
		var infoWindowHtml = '<div id="result"></div> ' +
		'<div id="contact" class="contact">	' +
		'  <form method="post" action="contact.php" name="contactform" id="contactform" autocomplete="on">' +
	    '    <fieldset class="contact">' +
	    '      <legend class="contact">LE GROUPE DE ' + name +'</legend>' +
	    '      <div>' +
	    '        <label for="name" class="contact">Votre nom</label>' +
	    '        <input name="name" type="text" id="name" placeholder="Entrez votre nom" class="contact"/> ' +
	    '      </div>' +
	    '      <div>' +
	    '        <label for="email" class="contact">Email</label>' +
	    '        <input name="email" type="email" id="email" placeholder="Entrez votre adresse email" pattern="^[A-Za-z0-9](([_\.\-]?[a-zA-Z0-9]+)*)@([A-Za-z0-9]+)(([\.\-]?[a-zA-Z0-9]+)*)\.([A-Za-z]{2,})$" class="contact"/>' +
	    '      </div>' +
	    '      <div>' +
		'  	     <label for="phone" class="contact">Téléphone <small>(optionel)</small></label>' +
	    '        <input name="phone" type="tel" id="phone" placeholder="Entrez votre numéro de téléphone" class="contact"/>' +
	    '      </div>' +
	    /* add new form elements here */
	    '      <div>' +
		'  	     <label for="message" class="contact">Message </label>' +
		        mappedContactForm.messageFormField()  + 
	    '      </div>' +
	    '      <input type="hidden" name="destination_email" value="' + email + '">' +
		'  	   <input type="submit" class="submit" id="submit" value="Envoyer"/>	' +
		'    </fieldset>' +
		'  </form>' +
		'</div>' 
	return infoWindowHtml;
}

/**
 * validates the form and send the ajax request to contact.php
 */
mappedContactForm.validate = function(){
	$(function(){
		$(".submit").live('click', function(){
          $("#contactform").validate({
	          errorPlacement: function(error, element) {
	              element.parent().addClass('error');
	          },
	          rules: {
	              name: {
	                  required: true
	              },
	              email: {
	                  required: true,
	                  email: true
	              },
                  /* add new validations here */
	              message: {
	              	required: true
	              }
	          },
	          submitHandler: function(contact) {
	              jQuery(contact).ajaxSubmit({
	                  target: "#result",
	                  success: function() {
	                      $("#contact").fadeOut('slow', function() {
	                         // Animation complete.
	                      });
	                  }
	              });
	          }
	      });
	    });
    });
}

/**
 * Returns a input field instead of a textarea for Firefox. For some reason Firefox 4 chrashed wenn using textarea in a 
 * inside a info window. http://support.mozilla.com/de/questions/785326
 */
mappedContactForm.messageFormField = function(){
	var messageFormString = '';
	if ( $.browser.mozilla ) {
	  messageFormString = ' <input name="message" type="text" id="message" placeholder="Votre message" class="contact"/> ';
	} else {
	  messageFormString = ' <textarea name="message" cols="30" rows="3" id="message" placeholder="Votre message" spellcheck="true" class="contact"></textarea>'
	}
	return messageFormString;
}

/**
 * Helper to make markers linkable
 */
mappedContactForm.openInfoWindow = function(marker){
	google.maps.event.trigger(marker, mappedContactForm.listener);
}
