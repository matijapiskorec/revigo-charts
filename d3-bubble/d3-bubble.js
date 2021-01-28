
var globalColor = 'p-value';
var globalSize = 'annotations';
var selectedGOterms = [];

// Raw data containing original values
var rawData = [
  {'id': 'GO:00001', 'name':'name 1', 'X': 80, 'Y': 167, 'p-value': 0.01, 'annotations': 100},
  {'id': 'GO:00002', 'name':'name2', 'X': 60, 'Y': 136, 'p-value': 0.1,   'annotations': 95},
  {'id': 'GO:00003', 'name':'name3', 'X': 28, 'Y': 184, 'p-value': 0.5,    'annotations': 5},
  {'id': 'GO:00004', 'name':'name4', 'X': 72, 'Y': 278, 'p-value': 0.05, 'annotations': 150},
  {'id': 'GO:00005', 'name':'name5', 'X': 81, 'Y': 200, 'p-value': 0.2,  'annotations': 140},
  {'id': 'GO:00006', 'name':'name6', 'X': 72, 'Y': 170, 'p-value': 0.025,  'annotations': 1},
  {'id': 'GO:00007', 'name':'name7', 'X': 58, 'Y': 477, 'p-value': 0.12,  'annotations': 30},
  {'id': 'GO:00008', 'name':'name6', 'X': 12, 'Y': 270, 'p-value': 0.25,  'annotations': 15},
  {'id': 'GO:00009', 'name':'name2', 'X': 100, 'Y': 10, 'p-value': 0.01,  'annotations': 120},
  {'id': 'GO:00010', 'name':'name10', 'X': 130, 'Y': 140, 'p-value': 0.001,  'annotations': 80},
  {'id': 'GO:00011', 'name':'name11', 'X': 150, 'Y': 222, 'p-value': 0.5,  'annotations': 30},
  {'id': 'GO:00012', 'name':'name12', 'X': 160, 'Y': 65, 'p-value': 0.05,  'annotations': 130},
  {'id': 'GO:00013', 'name':'name13', 'X': 170, 'Y': 150, 'p-value': 0.005,  'annotations': 110}
];

var chart = new Chart(rawData);

chart.draw("p-value", "annotations");

var target = document.querySelector('#go-terms-selector');

rawData.forEach( function(d,i) {

    var input = document.createElement("input");
    input.type = "checkbox";
    input.name = "go-term";
    input.value = d.id; // GO id is used as identifier
    target.appendChild(input);

    var label = document.createElement("label");
    label.for = d.id; // GO is is used as identifier
    label.innerHTML = d.name; // GO description is used for display
    target.appendChild(label);

    target.appendChild(document.createElement("br"));

});

document.getElementById('color-selector').addEventListener('change', function() {
    console.log('You selected: ', this.value, ' for color.');
    globalColor = this.value;
    chart.draw(globalColor,globalSize);
});


document.getElementById('size-selector').addEventListener('change', function() {
    console.log('You selected: ', this.value, ' for size.');
    globalSize = this.value;
    chart.draw(globalColor,globalSize);
});

document.getElementById('go-terms-selector').addEventListener('change', function() {

    var checkboxes = document.querySelectorAll('input[name="go-term"]:checked');

    selectedGOterms = [];
    checkboxes.forEach((checkbox) => {
      selectedGOterms.push(checkbox.value);
    });

    // console.log(selectedGOterms);

    // Select appropriate GO terms on chart!
    rawData.forEach( function(d,i) {
        if (selectedGOterms.includes(d.id)) { 
            chart.persistTooltip(d.id);
        } else {
            chart.unpersistTooltip(d.id);
        }
    });

});

function Chart(rawData, color, size) {

    // Inspired by Vue.js way
    var vm = this;

    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 20, bottom: 40, left: 50},
        width = 700 - margin.left - margin.right,
        height = 620 - margin.top - margin.bottom;

    var tooltipLineOffset = 2; // distance from tooltip line to tooltip text
    var axisMargin = 0.15; // 15% larger axes than the range of data

    this.draw = function(color,size) {

        // Visualization data where color and size are mapped from one of the columns in original data
        vm.data = rawData.map(function(d) {
                return {'id': d['id'],
                        'name': d['name'],
                        'X': d['X'],
                        'Y': d['Y'],
                        'color': d[color],
                        'size': d[size]};
        });

        // Remove all children elements of the chart div!
        d3.select("#chart_div").selectAll("*").remove();

        // append the svg object to the body of the page
        var svg = d3.select("#chart_div")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");

        // Add X axis
        var minX = Math.min(...vm.data.map(function(d){return d.X}));
        var maxX = Math.max(...vm.data.map(function(d){return d.X}));
        vm.x = d3.scaleLinear()
            .domain([minX-axisMargin*(maxX-minX),maxX+axisMargin*(maxX-minX)])
            .range([ 0, width ]);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(vm.x));

        // Add X axis label
        svg.append("text")
          .attr("text-anchor", "end")
          .attr("x", width)
          .attr("y", height + margin.top + 20)
          .text("MDS component 1");

        // Add Y axis
        var minY = Math.min(...vm.data.map(function(d){return d.Y}));
        var maxY = Math.max(...vm.data.map(function(d){return d.Y}));
        vm.y = d3.scaleLinear()
            .domain([minY-axisMargin*(maxY-minY),maxY+axisMargin*(maxY-minY)])
            .range([ height, 0]);

        svg.append("g")
            .call(d3.axisLeft(vm.y));

        // Y axis label
        svg.append("text")
          .attr("text-anchor", "end")
          .attr("transform", "rotate(-90)")
          .attr("y", -margin.left+20)
          .attr("x", -margin.top)
          .text("MDS component 2")

        // Add a scale for bubble size
        vm.scaleSize = d3.scaleLinear()
            .domain([Math.min(...vm.data.map(function(d){return d['size']})),
                     Math.max(...vm.data.map(function(d){return d['size']}))])
            .range([ 5, 20]);

        // Add a scale for bubble color
        vm.scaleColor = d3.scaleLog()
            .domain([Math.min(...vm.data.map(function(d){return d['color']})),
                     Math.max(...vm.data.map(function(d){return d['color']}))])
            .range(['red','steelblue']);

        // Add data circles
        svg.append('g')
            .attr("id","data")
            .selectAll("dot")
            .data(vm.data)
            .enter()
            .append("circle")
            .attr("class", "bubbles")
            .attr("id",function(d){return "circle-"+d['id'].replace(":","-")})
            .attr("cx", function (d) { return vm.x(d['X']); } )
            .attr("cy", function (d) { return vm.y(d['Y']); } )
            .attr("r", function (d) { return vm.scaleSize(d['size']); } )
            .style("fill", function (d) { return vm.scaleColor(d['color']); } )
            .on("mouseover", function(d) {return vm.showTooltip(d['id'])} )
            .on("mouseleave", function(d) {return vm.hideTooltip(d['id'])} )
            .on("click", function(d) {return vm.toggleTooltip(d['id'])} )

        // Add a group for tooltips - it needs to be bellow data group so that labels are visible!
        svg.append("g")
            .attr("id","tooltips");

        // Toggle tooltips passed as an argument
        selectedGOterms.forEach(function(id){
            vm.persistTooltip(id);
        });  

        // Draw legend for p-values (node color)
        vm.drawColorLegend("#legend-color", vm.scaleColor, color); 

        // Draw legend for GOA annotations (circle radius)
        vm.drawSizeLegend("#legend-size", vm.scaleSize, size);

    }

    // Generate legend with continuous colors from a prespecified scale
    // Strangely, this is not built in D3 by default!?
    // http://bl.ocks.org/syntagmatic/e8ccca52559796be775553b467593a9f
    this.drawColorLegend = function(selector_id, colorscale, legendLabel) {

      var legendheight = 100,
          legendwidth = 80,
          margin = {top: 20, right: 60, bottom: 10, left: 2};
      
      d3.select(selector_id).selectAll("*").remove();

      var canvas = d3.select(selector_id)
        .style("height", legendheight + "px")
        .style("width", legendwidth + "px")
        .style("position", "relative")
        .append("canvas")
        .attr("height", legendheight - margin.top - margin.bottom)
        .attr("width", 1)
        .style("height", (legendheight - margin.top - margin.bottom) + "px")
        .style("width", (legendwidth - margin.left - margin.right) + "px")
        .style("border", "1px solid #000")
        .style("position", "absolute")
        .style("top", (margin.top) + "px")
        .style("left", (margin.left) + "px")
        .node();

      var ctx = canvas.getContext("2d");

      var legendscale = d3.scaleLog()
        .range([1, legendheight - margin.top - margin.bottom])
        .domain(colorscale.domain());

      // Generate image with continuous scale colors. If too slow see faster solution bellow!
      // http://bl.ocks.org/mbostock/048d21cf747371b11884f75ad896e5a5
      // http://stackoverflow.com/questions/4899799
      //       /whats-the-best-way-to-set-a-single-pixel-in-an-html5-canvas   
      d3.range(legendheight).forEach(function(i) {
        ctx.fillStyle = colorscale(legendscale.invert(i));
        ctx.fillRect(0,i,1,1);
      });

      var legendaxis = d3.axisRight()
        .scale(legendscale)
        .tickSize(6)
        .ticks(4);

      var svg = d3.select(selector_id)
        .append("svg")
        .attr("height", (legendheight) + "px")
        .attr("width", (legendwidth) + "px")
        .style("position", "absolute")
        .style("left", "0px")
        .style("top", "0px");

      svg
        .append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + (legendwidth - margin.left - margin.right + 3) + 
                                    "," + (margin.top) + ")")
        .call(legendaxis);

      svg.append("text")
        .attr("x", 0)
        .attr("y", 12)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text(legendLabel); 

    }

    // https://www.youtube.com/watch?v=XmVPHq4NhMA
    this.drawSizeLegend = function(selector_id, sizescale, legendLabel) {

      var legendheight = 100,
          legendwidth = 100,
          margin = {top: 20, right: 70, bottom: 10, left: 2};

      d3.select(selector_id).selectAll("*").remove();

      d3.select(selector_id)
        .style("height", legendheight + "px")
        .style("width", legendwidth + "px")
        .style("position", "relative")

      var svg = d3.select(selector_id)
        .append("svg")
        .attr("height", (legendheight) + "px")
        .attr("width", (legendwidth) + "px")
        .style("position", "absolute")
        .style("left", "0px")
        .style("top", "0px");

      svg
        .append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + (legendwidth - margin.left - margin.right + 3) + 
                                    "," + (margin.top) + ")")
        .call( function(selection) {

            var minScale = sizescale.domain()[0];
            var midScale = 0.5*(sizescale.domain()[1]-sizescale.domain()[0]);
            var maxScale = sizescale.domain()[1];
            var groups = selection.selectAll('g').data([
                minScale,
                midScale >= 1.0 ? Math.round(midScale) : midScale,
                maxScale
            ]);

            var groupsEnter = groups.enter().append('g');

            groupsEnter
                .merge(groups)
                .attr('transform',(d,i) => 'translate(0,'+i*20+')');

            groups.exit().remove();

            groupsEnter
                  .append('circle')
                  .merge(groups.select('circle'))
                  .attr('r',sizescale)
                  .attr('stroke','black')
                  .attr('fill','white')

            groupsEnter
                  .append('text')
                  .merge(groups.select('text'))
                  .text(d => d)
                  .attr('dy','0.32em')
                  .attr('x',25)

          svg.append("text")
            .attr("x", 0)
            .attr("y", 12)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(legendLabel); 

        });
    }

    // Tooltips are created as needed and hidden/revealed later
    // In this way we allow for multiple tooltips to be visible at the same time!
    this.createTooltip = function(id,visibilityClass) {

        // visibilityClass: Either "show" or "persist" which determine whether tooltip is persistent.

        var GOterm = id.replace(":","-");

        // Retrieve data point for which tooltip is created
        var d = vm.data.filter(function(d){return d['id']==id})[0];

        // Tolltip text is positioned outside of the data circle, with additional margin of 2% data range
        var textX = vm.x(d['X'])+vm.scaleSize(d['size'])+0.02*(vm.x.range()[1]-vm.x.range()[0]);
        var textY = vm.y(d['Y'])-vm.scaleSize(d['size'])+0.02*(vm.y.range()[1]-vm.y.range()[0]);

        // Group for the tooltip - line, text and the surrounding rectangle
        d3.select("#tooltips")
          .append("g")
          .attr("id","tooltip-"+GOterm)
          .attr("class","tooltip")
                .on("mousedown", dragTooltip);

        // Create tooltip text
        d3.select("#tooltip-"+GOterm)
            .append("text")
            .attr("class","popuptext "+visibilityClass) 
            .attr("id","text-"+GOterm) 
            .attr("x",textX)
            .attr("y",textY)
            .text(d['name'] );

        // Tooltip rectangle box surrounding the tooltip text
        var rect = document.getElementById("text-"+GOterm).getBBox();
        d3.select("#tooltip-"+GOterm)
          .insert("rect","#text-"+GOterm) // insert before tooltip text so that it is bellow
          .attr("class","popuprect "+visibilityClass)
          .attr("id","rect-"+GOterm)
          .attr("x",rect.x-3)
          .attr("y",rect.y-3)
          .attr("width",rect.width+6)
          .attr("height",rect.height+6);

        var x2 = textX-tooltipLineOffset;
        var y2 = textY+tooltipLineOffset;
        var intersect = findIntersect([vm.x(d['X']), vm.y(d['Y'])], [x2,y2], vm.scaleSize(d['size']));

        // Create tooltip line connecting data circle with the text box
        d3.select("#tooltip-"+GOterm)
            .insert("line","#rect-"+GOterm) // insert before tooltip rectangle so that it is bellow
            .attr("class","popupline "+visibilityClass)
            .attr("id","line-"+GOterm)
            .attr("x1", intersect[0] )
            .attr("y1", intersect[1] )
            .attr("x2",x2)
            .attr("y2",y2-5)
            .attr("stroke","black");
    } 

    // Showing a tooltip is done by attaching a corresponding CSS class to the tooltip text and line
    this.showTooltip = function(id) {

        var GOterm = id.replace(":","-");

        if ($("#text-"+GOterm).length==0) {
            vm.createTooltip(id,"show");
        } else {
            if(!$("#text-"+GOterm).hasClass('show')){
                $("#text-"+GOterm).addClass('show');
             }
            if(!$("#line-"+GOterm).hasClass('show')){
                $("#line-"+GOterm).addClass('show');
             }
            if(!$("#rect-"+GOterm).hasClass('show')){
                $("#rect-"+GOterm).addClass('show');
             }
        }
    }

    this.persistTooltip = function(id) {

        var GOterm = id.replace(":","-");

        if ($("#text-"+GOterm).length==0) {
            vm.createTooltip(id,"persist");
        } else {
            if(!$("#text-"+GOterm).hasClass('persist')){
                $("#text-"+GOterm).addClass('persist');
             }
            if(!$("#line-"+GOterm).hasClass('persist')){
                $("#line-"+GOterm).addClass('persist');
             }
            if(!$("#rect-"+GOterm).hasClass('persist')){
                $("#rect-"+GOterm).addClass('persist');
             }
        }
    }

    // Hidding a tooltip is done by removing a corresponding CSS class to the tooltip text and line
    this.hideTooltip = function(id) {

        var GOterm = id.replace(":","-");

        if($("#text-"+GOterm).hasClass('show')){
            $("#text-"+GOterm).removeClass('show');
        }

        if($("#line-"+GOterm).hasClass('show')){
            $("#line-"+GOterm).removeClass('show');
        }

        if($("#rect-"+GOterm).hasClass('show')){
            $("#rect-"+GOterm).removeClass('show');
        }

    }

    this.unpersistTooltip = function(id) {

        var GOterm = id.replace(":","-");

        if($("#text-"+GOterm).hasClass('persist')){
            $("#text-"+GOterm).removeClass('persist');
        }

        if($("#line-"+GOterm).hasClass('persist')){
            $("#line-"+GOterm).removeClass('persist');
        }

        if($("#rect-"+GOterm).hasClass('persist')){
            $("#rect-"+GOterm).removeClass('persist');
        }

    }

    // Tooltip toggling is triggered upon click and makes a tooltip persistent
    this.toggleTooltip = function(id) {

        var GOterm = id.replace(":","-");

        if ($("#text-"+GOterm).length==0) {
            vm.createTooltip(id,"persist");
        } else {
            $("#text-"+GOterm).toggleClass("persist");
            $("#line-"+GOterm).toggleClass("persist");
            $("#rect-"+GOterm).toggleClass("persist");
        }

        // Select checkboxes which correspond to selected terms on chart!
        var selectedItems = [...document.querySelectorAll("text.persist")]
                                            .map(x=>x.id.replace("text-","").replace("-",":"));
        if (selectedItems) {

            rawData.forEach( function(d,i) {
                if ( selectedItems.includes(id) ) {
                    document.querySelectorAll('input[value="'+id+'"]')[0].checked = true;
                } else {
                    document.querySelectorAll('input[value="'+id+'"]')[0].checked = false;
                }
            });

            // Assign a global variable which stores currently selected terms!
            selectedGOterms = selectedItems;

        }

    }

    // Dragging a tooltip updates the coordinates of tooltip based on the position of the mouse
    var dragTooltip = function() {

        // dragTooltip operates on the tooltip group so we have to extract the id of the GO term from it
        var GOterm = d3.select(this).attr("id").replace("tooltip-","");

        // Offsets for text and rectangle so that dragging is smooth
        var textOffsetX = d3.select("#text-"+GOterm).attr('x') - d3.mouse(this)[0];
        var textOffsetY = d3.select("#text-"+GOterm).attr('y') - d3.mouse(this)[1];
        var rectOffsetX = d3.select("#rect-"+GOterm).attr('x') - d3.mouse(this)[0];
        var rectOffsetY = d3.select("#rect-"+GOterm).attr('y') - d3.mouse(this)[1];

        d3.select(this)
            .on("mousemove", function(e){

                // Update position of the tooltip text
                d3.select("#text-"+GOterm)
                    .attr("x",function(d){
                        return d3.mouse(this)[0] + textOffsetX;
                    })
                    .attr("y",function(d){
                        return d3.mouse(this)[1] + textOffsetY;
                    });

                // Update the position of the connecting line
                var x1 = Number(d3.select("#circle-"+GOterm).attr("cx"));
                var y1 = Number(d3.select("#circle-"+GOterm).attr("cy"));
                var r = Number(d3.select("#circle-"+GOterm).attr("r"));
                var x2 = d3.mouse(this)[0]+textOffsetX-tooltipLineOffset;
                var y2 = d3.mouse(this)[1]+textOffsetY+tooltipLineOffset;

                // Connecting line will begin at data circle edge, not at the center!
                var intersect = findIntersect([x1,y1],[x2,y2],r);

                d3.select("#line-"+GOterm)
                    .attr("x2", x2)
                    .attr("y2", y2-5)
                    .attr("x1", intersect[0])
                    .attr("y1", intersect[1]);

                // Update the position of the surrounding rectangle
                d3.select("#rect-"+GOterm)
                  .attr("x",d3.mouse(this)[0]+rectOffsetX)
                  .attr("y",d3.mouse(this)[1]+rectOffsetY);

            })
            .on("mouseup", function(){
                d3.select(this).on("mousemove", null); 
            });
    };

}

// Find the intersect between a line and circle of radius r, if line starts at the circle center
// (coordinates x) and ends at coordinates y
function findIntersect(x, y, r) {
    var M = (y[1]-x[1])/(y[0]-x[0]);
    var signX = Math.sign(y[0]-x[0]);
    var signY = Math.sign(y[1]-x[1]);
    return [x[0] + signX*(r/Math.sqrt(1+M*M)), x[1] + signY*(r/Math.sqrt(1+1/(M*M)))];
}

