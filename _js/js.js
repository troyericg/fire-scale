<!--- hide script from old browsers

$(document).ready(function(){
	
	// SVG DIMENSIONS
	var width = 20,
		height = 294;

	// RECTANGLES FOR SCALE
	var rectW = 20,
		rectH = 6;

	var color = d3.scale.linear().domain([1,20]).range(['gold', 'crimson']);

	var svg = d3.select("div#fire-nav").append("svg")
		.attr({
			width: width,
			height: height
		});
		


	// NAV TOOLTIPS 
	function tooltipOver() {
		var square = d3.select(this);
		d3.select("div.tooltip").style("display", "block");
		d3.select("li.name-county strong").text(square.attr("name-county"));
		d3.select("li.num-fires strong").text(square.attr("num-fires"));
	}

	function tooltipOut() {
		//var square = d3.select(this);
		d3.select("div.tooltip").style("display", "none");	
	}

	function tooltipMove() {
		var tooltip = d3.select("div.tooltip");
		var coord = d3.mouse(this);
		var mY = $(this).offset().top;
		tooltip.style("left", (coord[0] + 75) + "px" );
		tooltip.style("top", mY + "px" );
	}

	function jumpTo(){
		var link = $(this)[0].getAttribute("name-county");
		var sectionLink = "section.container." + link;
		console.log(sectionLink);
		scrollClick(sectionLink);

		//function takes two params that are fed to the animate method. 
		function scrollClick(sectionLink) {
			var link_top = $(sectionLink).offset().top;
			$('html, body').animate({scrollTop: link_top - 20},'ease');
		};
	}

	//ACCESSES AARON'S API 
	d3.json("http://calfire-api.herokuapp.com/counties.json", function(jdata){
		
		// SORTING OBJECT FUNCTION 
		var fireSorted = jdata.sort(function(a, b) {
			if (a.county.fires.length < b.county.fires.length) {
				return -1;
			}
			else if (a.county.fires.length > b.county.fires.length) {
				return 1;
			}
			return 0;
		});

		// MAKE FIRE SCALE NAV
		svg.selectAll("rect").data(fireSorted)
				.enter()
				.append("svg:rect")
				.attr({
					"fill": function(d){ return color(d.county.fires.length); },
					"width":rectW,
					"height":rectH,
					"name-county": function(d){ return d.county.name; },
					"num-fires": function(d){ return d.county.fires.length; },
					"y": function(d,i){ return i * 6 }
				})
				.on("mousemove",tooltipMove)
				.on("mouseover", tooltipOver)
				.on("mouseout", tooltipOut)
				.on("click", jumpTo);


		// MAKE FIRE ENTRIES 
		var entrypoint = d3.select("div#entry-container");
		var entryTemplate = Mustache.compile( d3.select("#entry-template-new").html() );
		var dataTemplate = {};

		entrypoint.selectAll("div").data(fireSorted)
				.enter().append("div")
				.attr({
					"class":"entry",
					"data-name": function(d){ return d.county.name; },
					"data-num": function(d){ return d.county.fires.length; }
				})
				.html( function (d){ return toTemplate(d); } );

		// MUSTACHE.JS TEMPLATING 
		function toTemplate(val){
			if (val.county.fires.length > 0) {
				dataTemplate = {
					date: val.county.fires[0].fire.date,
					countyName: val.county.name,
					fireName: val.county.fires[0].fire.name,
					acreage: val.county.fires[0].fire.acreage,
					containment: val.county.fires[0].fire.containment,
					location: val.county.fires[0].fire.location,
					clr: function() {
						return color(val.county.fires.length); 
					}
				}
				return entryTemplate(dataTemplate);
			}
		};

		var items = $("div#entry-container div.entry");
		var redItems = $.grep(items, function(itm){
			return $(itm).data("num") === 0;
		});

		$(redItems).remove();
		$("div#entry-container").animate({"opacity":1}, 300);

	});
	
	

	// Unhooking Nav 
	$(window).scroll(function(){
		var $win = $(this);
		var $container = $('div#main');
		var $box = $('div#fire-nav');
		var boxBottom = $container.position().top + $container.innerHeight();
			
		if ($win.scrollTop() + 30 >= $container.offset().top) {
			$box.css({'position':'fixed','top':30, 'bottom':'auto' });
		} if ($win.scrollTop() >= boxBottom - 360) {
			$box.css({'position':'absolute', 'top':'auto', 'bottom':30 });
		} else if ($win.scrollTop() <= $container.offset().top) {
			$box.css({'position':'absolute', 'top': 30, 'bottom':'auto' });
		}
		
	});

	// Show map
	$("div.entry h2").on("click", function(){
		$(this).parent().addClass("show-top");
	});

});

// stop hiding script -->