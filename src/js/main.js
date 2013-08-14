
//Variables of global context
var serie = [];
var series = [];
var graph, scales = [], data2, graph, legend, slider;

function data_render(){
    d3.tsv("data/wiki_data_simple.tsv", function(error, data){  
	if(error) return console.warn(error);

	var palette = new Rickshaw.Color.Palette( { scheme: 'spectrum14' } );
	var dataParser = d3.time.format("%b-%Y").parse;

	data.reverse();
	var keys = [];

	Object.keys(data[0]).forEach(function(d){
	    serie.push([]);
	    keys.push(d);
	});

	keys.reverse();
	keys.pop();

	data2 = data;
/*
	var s = [];
	max = Number.MIN_VALUE;
	min = Number.MAX_VALUE;
	keys.forEach(function(k){
	    for(var i = 0; i < data.length; i++){
		if(+data[i][k] < min && data[i][k] != " ") min = +data[i][k];
		if(+data[i][k] > max && data[i][k] != " ") max = +data[i][k];
	    }

	    scales.push(d3.scale.linear().domain([min, max]).nice());
	    console.log("Max:" + max + " Min:" + min + " V:" + k);
	    min = Number.MAX_VALUE;
	    max = Number.MIN_VALUE;
	});
*/
	data.forEach(function(d){
	    var date = dataParser(d.date).getTime()/1000;
	    
	    for(var k = 0; k < keys.length; k++){
		serie[k].push({ x: date, y: +d[keys[k]] });
	    }
	});
	
	for(var k = 0; k < keys.length; k++){
	    series.push({ name: keys[k], data: serie[k], color: palette.color() });
	}

	graph = new Rickshaw.Graph( {
	    element: document.getElementById("chart"),
	    width: document.body.clientWidth * 0.78,
	    renderer: 'area',
	    stroke: true,
	    height: 300,
	    series: series
	});

	graph.render();

	var monthName = ["Jan", "Fev", "Mar","Abr","Mai","Jun","Jul","Ago","Set","Out", "Nov", "Dez"];

	var hoverDetail = new Rickshaw.Graph.HoverDetail( {
	    graph: graph,
	    yFormatter: function(y) { return y},
	    xFormatter: function(x){
		var d = new Date(x * 1000);
		return String(monthName[d.getMonth()] + " - " + d.getFullYear());
	    }
	});

	legend = new Rickshaw.Graph.Legend( {
	    element: document.getElementById('legend'),
	    graph: graph
	});    

	annotator = new Rickshaw.Graph.Annotate( {
	    graph: graph,
	    element: document.getElementById('timeline')
	});

	var shelving = new Rickshaw.Graph.Behavior.Series.Toggle( {
	    graph: graph,
	    legend: legend
	});

	var order = new Rickshaw.Graph.Behavior.Series.Order( {
	    graph: graph,
	    legend: legend
	});

	var ticksTreatment = 'glow';

	var xAxis = new Rickshaw.Graph.Axis.Time( {
	    graph: graph
	});

	xAxis.render();
/*
	var yAxis = new Rickshaw.Graph.Axis.Y( {
	    graph: graph,
	    orientation: "right",
	    tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
	    ticksTreatment: ticksTreatment
	});

	yAxis.render();
*/
	slider = new Rickshaw.Graph.RangeSlider( {
	    graph: graph,
	    element: $('#slider')
	});

	graph.update();
    });
}

function events_render(file_name){
    d3.json(file_name, function(error, events){
	if(error) console.warm(error);
	window.events = events;

	var dataParse = d3.time.format("%Y-%m").parse;
	console.log("-------");
	window.events.vandalismo.forEach(function(d){
	    annotator.add(dataParse(d.date)/1000, d.event);
	});

	annotator.update();
    });
}

function switch_events(event_tag){
    var events = document.getElementById("timeline");
    events.innerHTML = "";

    annotator = new Rickshaw.Graph.Annotate( {
	graph: graph,
	element: document.getElementById('timeline')
    });

    var dataParse = d3.time.format("%Y-%m").parse;

    window.events[event_tag].forEach(function(d){
	annotator.add(dataParse(d.date)/1000, d.event);
    });

    annotator.update();
}

data_render();
events_render("data/events.json");
