// display the lightbox
function lightbox(insertContent){

	// jQuery wrapper (optional, for compatibility only)
	(function($) {

		// add lightbox <div/>'s if not previously added
		if($('#lightbox').size() == 0){
			var theLightbox = $('<div class="box" id="lightbox"></div>');

			$('body').append(theLightbox);
		}

		// remove any previously added content
		$('#lightbox').empty();

		// insert HTML content
		if(insertContent != null){
			$('#lightbox').append(insertContent);
			$("#close-icone").click(function(e){
				closeLightbox();
			});
		}

		// move the lightbox to the current window top + 100px
		$('#lightbox').css('top', $(window).scrollTop());

		// display the lightbox
		$('#lightbox').show();

	})(jQuery); // end jQuery wrapper

}

// close the lightbox
function closeLightbox(){

	// jQuery wrapper (optional, for compatibility only)
	(function($) {
		$('#lightbox').hide();
		$('#lightbox').empty();

	})(jQuery); // end jQuery wrapper

}