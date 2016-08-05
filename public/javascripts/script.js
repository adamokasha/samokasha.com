$(document).ready(function(){
	// Nav docking effect
	$(window).on('scroll', function(){
		if($(window).scrollTop() > $('#main-nav').height()){
			$('#main-nav').addClass('scrolled white-nav');
			$('.top.bkg').addClass('blurred');
			$('#nav-burger span, #nav-burger span:before, #nav-burger span:after').addClass('bkg-grey');
		} else{
			$('#main-nav').removeClass('scrolled white-nav')
			$('.top.bkg').removeClass('blurred');
			$('#nav-burger span, #nav-burger span:before, #nav-burger span:after').removeClass('bkg-grey');
		}
	});
	
	// Nav burger and nav ul animations
	$('#nav-burger').on('click', function(){
			$(this).toggleClass('active');
			$('.navigation').toggleClass('show');
			// If mobile navbar docked at top, toggling it will set background from transparent to white
			if($(window).scrollTop() <= $('#main-nav').height()){
				$('#main-nav').toggleClass('white-nav');
				$('#nav-burger span, #nav-burger span:before, #nav-burger span:after').toggleClass('bkg-grey');
			}
	});
	
	// Bio accordion animations
	$('.bio-header').on('click', function(){
		// Show paragraph or list
		$(this).siblings('.submenu').toggleClass("selected");
		// Animate arrow
		$(this).children('i').toggleClass('rotated');
	});
	
})