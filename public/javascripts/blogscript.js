$(document).ready(function(){
	// Nav docking effect
	$(window).on('scroll', function(){
		if($(window).scrollTop() > $('#main-nav').height()){
			$('#main-nav').addClass('scrolled');
		} else{
			$('#main-nav').removeClass('scrolled')
		}
	});

	// Nav burger and nav ul animations
	$('.nav-burger').on('click', function(){
			$(this).toggleClass('active');
			$('.nav-ul').toggleClass('show');
	});
	
	$('.bio-header').on('click', function(){
		// Show paragraph or list
		$(this).siblings('.submenu').toggleClass("selected");
		// Animate arrow
		$(this).children('i').toggleClass('rotated');
	});
	
})