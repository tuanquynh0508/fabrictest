var canvas = new fabric.Canvas('canvas');

canvas.on('mouse:down', function(e) {
    selectShape(e)
});

//OPTION DEFAULT////////////////////////////////////////////////////////////////
var defaultProperties = {
    borderColor: 'blue',
    cornerColor: 'blue',
    cornerSize: 5,
    fill: '#999999',
    stroke: '#000000'
};

//EVENT/////////////////////////////////////////////////////////////////////////
function selectShape(e) {
    if (e.target) {
        //e.target = canvas.relatedTarget;
        if (e.target.stroke) {
            var strokeColor = e.target.stroke.toString().substr(0, 7);
            var strokeColorValue = e.target.stroke.toString().substr(1, 6);
            console.log(strokeColorValue);
            $('#shapeStroke').css({
                'background-color': strokeColor
            });
            $('#shapeStroke').val(strokeColorValue);
        }
        if (e.target.fill) {
            document.getElementById("criempi2").setAttribute("style", "background-color:" + e.target.fill.toString().substr(0, 7));
            document.getElementById("criempi").setAttribute("style", "background-color:" + e.target.fill.toString().substr(0, 7));
            document.getElementById("criempi").value = e.target.fill.toString().substr(1, 6);
        }
    }
}


//ADD SHAPE/////////////////////////////////////////////////////////////////////
function addRectangle() {
    var property = {
        width: 100,
        height: 100
    };

    property = $.extend({}, defaultProperties, property);

    var shape = new fabric.Rect(property);
    canvas.add(shape);
}

function addCircle() {
    var radius = prompt("Please enter radius", 50);

    var property = {
        radius: radius,
        startAngle: -45,
        endAngle: 45
    };

    property = $.extend({}, defaultProperties, property);

    var shape = new fabric.Circle(property);
    canvas.add(shape);
}

function addTriangle() {
    var property = {
        width: 100,
        height: 100
    };

    property = $.extend({}, defaultProperties, property);

    var shape = new fabric.Triangle(property);
    canvas.add(shape);
}

function addEclipse() {
    var property = {
        rx: 50,
        ry: 100
    };

    property = $.extend({}, defaultProperties, property);

    var shape = new fabric.Ellipse(property);
    canvas.add(shape);
}

function addStar() {
    var numPoints = prompt("Please enter number point", 5);

    var property = {
        numPoints  : numPoints,
        innerRadius: 50,
        outerRadius: 100
    };

    property = $.extend({}, defaultProperties, property);

    var shape = new fabric.Star(property);
    canvas.add(shape);
}

// function addStar2() {
//     var property = {
//         numPoints  : 6,
//         innerRadius: 50,
//         outerRadius: 100
//     };

//     property = $.extend({}, defaultProperties, property);

//     var shape = new fabric.Star(property);
//     canvas.add(shape);
// }
