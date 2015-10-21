////////////////////////////////////////////////////
// fabric.js Modifications
////////////////////////////////////////////////////

////////////////////////////////////////////////////
// renderOnMove
/**
 * Indicates whether fabric.Canvas#add should re-render canvas when dragging an object.
 * Disabling this option could give a great performance boost when moving but relies on an external render loop
 */
fabric.StaticCanvas.prototype.renderOnMove = true; // #@#@#@#@# JRD

/**
  * Method that defines the actions when mouse is hovering the canvas.
  * The currentTransform parameter will definde whether the user is rotating/scaling/translating
  * an image or neither of them (only hovering). A group selection is also possible and would cancel
  * all any other type of action.
  * In case of an image transformation only the top canvas will be rendered.
  * @method __onMouseMove
  * @param e {Event} Event object fired on mousemove
  *
  */
fabric.StaticCanvas.prototype.__onMouseMove = function (e) {

  if (this.isDrawingMode) {
    if (this._isCurrentlyDrawing) {
      this._captureDrawingPath(e);
    }
    this.fire('mouse:move', { e: e });
    return;
  }

  var groupSelector = this._groupSelector;

  // We initially clicked in an empty area, so we draw a box for multiple selection.
  if (groupSelector !== null) {
    var pointer = getPointer(e);
    groupSelector.left = pointer.x - this._offset.left - groupSelector.ex;
    groupSelector.top = pointer.y - this._offset.top - groupSelector.ey;
    this.renderTop();
  }
  else if (!this._currentTransform) {

    // alias style to elimintate unnecessary lookup
    var style = this.upperCanvasEl.style;

    // Here we are hovering the canvas then we will determine
    // what part of the pictures we are hovering to change the caret symbol.
    // We won't do that while dragging or rotating in order to improve the
    // performance.
    var target = this.findTarget(e);

    if (!target) {
      // image/text was hovered-out from, we remove its borders
      for (var i = this._objects.length; i--; ) {
        if (this._objects[i] && !this._objects[i].active) {
          this._objects[i].setActive(false);
        }
      }
      style.cursor = this.defaultCursor;
    }
    else {
      // set proper cursor
      this._setCursorFromEvent(e, target);
      if (target.isActive()) {
        // display corners when hovering over an image
        target.setCornersVisibility && target.setCornersVisibility(true);
      }
    }
  }
  else {
    // object is being transformed (scaled/rotated/moved/etc.)
    var pointer = getPointer(e),
        x = pointer.x,
        y = pointer.y;

    this._currentTransform.target.isMoving = true;

    if (this._currentTransform.action === 'rotate') {
      // rotate object only if shift key is not pressed
      // and if it is not a group we are transforming

      if (!e.shiftKey) {
        this._rotateObject(x, y);

        this.fire('object:rotating', {
          target: this._currentTransform.target
        });
        this._currentTransform.target.fire('rotating');
      }
      if (!this._currentTransform.target.hasRotatingPoint) {
        this._scaleObject(x, y);
        this.fire('object:scaling', {
          target: this._currentTransform.target
        });
        this._currentTransform.target.fire('scaling');
      }
    }
    else if (this._currentTransform.action === 'scale') {
      this._scaleObject(x, y);
      this.fire('object:scaling', {
        target: this._currentTransform.target
      });
      this._currentTransform.target.fire('scaling');
    }
    else if (this._currentTransform.action === 'scaleX') {
      this._scaleObject(x, y, 'x');

      this.fire('object:scaling', {
        target: this._currentTransform.target
      });
      this._currentTransform.target.fire('scaling');
    }
    else if (this._currentTransform.action === 'scaleY') {
      this._scaleObject(x, y, 'y');

      this.fire('object:scaling', {
        target: this._currentTransform.target
      });
      this._currentTransform.target.fire('scaling');
    }
    else {
      this._translateObject(x, y);

      this.fire('object:moving', {
        target: this._currentTransform.target
      });

      this._setCursor(this.moveCursor);

      this._currentTransform.target.fire('moving');
    }
    // only commit here. when we are actually moving the pictures
    this.renderOnMove && this.renderAll(); // #@#@#@#@# JRD
  }
  this.fire('mouse:move', { target: target, e: e });
  target && target.fire('mousemove', { e: e });
}

////////////////////////////////////////////////////////////////////////
// Shadows
fabric.Object.prototype._resetShadow = function( ctx ) {
    if( this.shadow ) ctx.shadowColor = 'transparent'; // Resets shadows
};

fabric.Object.prototype._applyShadow = function( ctx, onStroke ) {

    var shadow       = this.shadow || false
      , hasShadows   = shadow !== false
      ;

    if( !hasShadows ) return false;

    onStroke = onStroke || false;
    var fillShadow   = hasShadows && typeof shadow.fillShadow   !== 'undefined' ?  shadow.fillShadow   : hasShadows
      , strokeShadow = hasShadows && typeof shadow.strokeShadow !== 'undefined' && shadow.strokeShadow ? true : false
      ;

    // Apply the shadow to the context
    if( ( !onStroke && fillShadow ) || ( onStroke && !fillShadow && strokeShadow ) )
    {
        // Casts shadows on geometry fill/stroke
        ctx.shadowColor = shadow.color   || 'black';
        ctx.shadowBlur  = shadow.blur    || 0;
        ctx.opacity     = shadow.opacity || this.opacity;
        if( shadow.offset || false )
        {
            // Shadow can be a number or an x/y object
            var offset = isNaN( shadow.offset ) ? shadow.offset: { x: offset, y: offset };
            ctx.shadowOffsetX = offset.x;
            ctx.shadowOffsetY = offset.y;
        }
        return true;
    }
    else if( onStroke && fillShadow && !strokeShadow )
    {
        // Avoids that stroke casts shadows "inside" the fill if not desired wirh the strokeShadow property
        //ctx.shadowColor = 'transparent';
        this._resetShadow( ctx );
        return true;
    }

    return false;

};


////////////////////////////////////////////////////
// fabric.Star
////////////////////////////////////////////////////
( function( global ) {

    "use strict";

    var fabric  = global.fabric || (global.fabric = { })
      , piBy2   = Math.PI * 2
      , extend  = fabric.util.object.extend
      , toFixed = fabric.util.toFixed
      ;

    if (fabric.Star) {
        fabric.warn('fabric.Star is already defined.');
        return;
    }

    /**
     * @class Circle
     * @extends fabric.Object
     */
    fabric.Star = fabric.util.createClass( fabric.Object, /** @scope fabric.Star.prototype */ {

        /**
         * @property
         * @type String
         */
        type: 'star',

        /**
         * Constructor
         * @method initialize
         * @param {Object} [options] Options object
         * @return {fabric.Star} thisArg
         */
        initialize: function(options) {

            options     = options || { };
            //if( options.outerRadius == options.innerRadius ) options.numPoints /= 2; // "Half" points to generate a regular polygon

            this.points = [];

            this.set( 'shadow'     , options.shadow      || null );

            this.set( 'numPoints'  , options.numPoints   || 0 );
            this.set( 'innerRadius', options.innerRadius || 0 );
            this.set( 'outerRadius', options.outerRadius || 0 );
            this.set( 'radius'     , options.outerRadius || 0 );

            this.callSuper( 'initialize', options );

            var diameter = this.get('radius') * 2;
            this.set( 'width', diameter ).set( 'height', diameter );

            this._setPoints();

        },

        /**
         * Sets the coordinates of the points for the given parameters
         * @private
         * @method _setPoints
         */
        _setPoints: function(ctx, noTransform) {

            var points = this.points = [];

            points.push( { 'x': 0, 'y': 0 - this.outerRadius } );
            for( var n = 1; n < this.numPoints * 2; n++ ) {
                var radius = n % 2 === 0 ? this.outerRadius : this.innerRadius
                  , angle  = n * Math.PI / this.numPoints
                  , x      =  radius * Math.sin( angle )
                  , y      = -radius * Math.cos( angle )
                  ;

                points.push( { 'x': x, 'y': y } );
            }

        },

        /**
         * Returns object representation of an instance
         * @method toObject
         * @return {Object} object representation of an instance
         */
        toObject: function() {
            return extend( this.callSuper('toObject'), {
                  numPoints  : this.get('numPoints')
                , innerRadius: this.get('innerRadius')
                , outerRadius: this.get('outerRadius')
                , radius     : this.get('radius')
                , points     : this.points
            } );
        },

        /**
         * Returns svg representation of an instance
         * @method toSVG
         * @return {string} svg representation of an instance
         */
        toSVG: function() {

            var points = []
              , p      = null;
            for( var i = 0, len = this.points.length; i < len; i++ ) {
                p = this.points[i];
                points.push( toFixed(p.x, 2), ',', toFixed(p.y, 2), ' ' );
            }

            return [
                '<polygon ',
                    'points="'   , points.join('')       , '" ',
                    'style="'    , this.getSvgStyles()   , '" ',
                    'transform="', this.getSvgTransform(), '" ',
                '/>'
            ].join('');

        },

        /**
         * @private
         * @method _render
         * @param ctx {CanvasRenderingContext2D} context to render on
         */
        _render: function(ctx, noTransform) {

            var points      = this.points
              , p           = null
              ;

            this._applyShadow( ctx ); // Shadow

            ctx.beginPath();

            // multiply by currently set alpha (the one that was set by path group where this object is contained, for example)
            ctx.globalAlpha *= this.opacity;

            p = points[0];
            ctx.moveTo( p.x, p.y );
            for( var n = 1, l = points.length; n < l; n++ ) {
                p = points[n];
                ctx.lineTo( p.x, p.y );
            }
            ctx.closePath();

            ctx.fillOpacity = 1;
            if( this.fill ) {
                ctx.fill();
            }
            if( this.stroke )
            {
                this._applyShadow( ctx, true ); // Stroke shadow. By default, avoids that stroke casts shadows "inside" the fill unless 'strokeShadow' is specified
                ctx.stroke();
            }

            this._resetShadow( ctx ); // Resets shadows

        },

        /**
         * Returns horizontal radius of an object (according to how an object is scaled)
         * @method getRadiusX
         * @return {Number}
         */
        getRadiusX: function() {
            return this.get('radius') * this.get('scaleX');
        },

        /**
         * Returns vertical radius of an object (according to how an object is scaled)
         * @method getRadiusY
         * @return {Number}
         */
        getRadiusY: function() {
            return this.get('radius') * this.get('scaleY');
        },

        /**
         * Sets radius of an object (and updates width accordingly)
         * @method setRadius
         * @return {Number}
         */
        setRadius: function(value) {
            this.radius = value;
            this.outerRadius = value;
            this.set( 'width', value * 2 ).set( 'height', value * 2 );
            this._setPoints();
        },

        /**
         * Sets inner radius of an object (and updates width accordingly)
         * @method setRadius
         * @return {Number}
         */
        setInnerRadius: function(value) {
            this.innerRadius = value;
            this._setPoints();
        },

        /**
         * Sets radius of an object (and updates width accordingly)
         * @method setRadius
         * @return {Number}
         */
        setOuterRadius: function(value) {
            this.outerRadius = value;
            this.set('width', value * 2).set('height', value * 2);
            this._setPoints();
        },

        /**
         * Sets number of points of the star object (and updates width accordingly)
         * @method setRadius
         * @return {Number}
         */
        setNumPoints: function(value) {
            this.numPoints = value;
            this._setPoints();
        },

        /**
         * Returns complexity of an instance
         * @method complexity
         * @return {Number} complexity of this instance
         */
        complexity: function() {
            return this.points.length;
        }
    });

    /**
     * Returns {@link fabric.Polygon} instance from an SVG element
     * Since SVG doesn't have a star primitive, we rely on polygons
     * @static
     * @method fabric.Star.fromElement
     * @param element {SVGElement} element to parse
     * @param options {Object} options object
     * @return {Object} instance of fabric.Polygon
     */
    fabric.Star.fromElement = function( element, options ) {

        if (!element) return null;
        return fabric.Polygon.fromElement( element, options );

    };

    /**
     * Returns {@link fabric.Star} instance from an object representation
     * @static
     * @method fabric.Star.fromObject
     * @param {Object} object Object to create an instance from
     * @return {Object} Instance of fabric.Star
     */
    fabric.Star.fromObject = function( object ) {
        return new fabric.Star( object );
    };

})( typeof exports != 'undefined' ? exports : this );


////////////////////////////////////////////////////////////////////////
// Elastic Stars Demo
// Converted from http://www.html5canvastutorials.com/labs/html5-canvas-elastic-stars-with-kineticjs/
var canvas      = null
  , stars       = []
  , currentStar = null
  ;

function addStar( canvas, index )
{

    var trans = null;
    var scale = Math.random();

    var star = new fabric.Star({
            lockScalingX: true,
            lockScalingY: true,
            lockUniScaling: true,

            left       : Math.random() * canvas.width,
            top        : Math.random() * canvas.height,
            numPoints  : 5,
            innerRadius: 50,
            outerRadius: 100,
            fill       : '#1e4705',
            stroke     : '#89b717',
            opacity    : 0.9,
            strokeWidth: 10,
            selectable : true,
            scaleX     : scale,
            scaleY     : scale,
            angle      : Math.random() * 180,
            shadow     : {
                color  : 'black',
                blur   : 10,
                offset : { x: 5, y: 5 },
                opacity: 0.6,
                fillShadow  : true,
                strokeShadow: false
            }
        });

    // Saves starting scales for effects
    star.startScaleX = scale;
    star.startScaleY = scale;
    star.index       = index;
    stars[ index ]   = star;

    canvas.add(star);

}

window.onload = function()
{
    canvas = new fabric.Canvas( 'c', { renderOnAddition: false, renderOnMove: false } );

    // Creates stars
    for(var n = 0; n < 10; n++)
        addStar( canvas, n );

    // Events to control objects
    canvas.on( 'object:moving', drag    );
    canvas.on( 'mouse:up'     , endDrag );

    // Main loop
    tick();
};

function tick() {
    // Main loop
    canvas.renderAll();
    fabric.util.requestAnimFrame( tick ); // Plans next iteration
}

function drag( ev )
{
    if( currentStar !== null ) return;
    var star    = ev.target;

    currentStar        = star.index;
    star.startScaleX   = star.scaleX;
    star.startScaleY   = star.scaleY;
    star.scaleX        = star.startScaleX * 1.2;
    star.scaleY        = star.startScaleY * 1.2;
    star.shadow.blur   = 20;
    star.shadow.offset = { x: 15, y: 15 };

    canvas.bringToFront( star );

    canvas.damaged = true;
}

function endDrag( ev )
{
    if( currentStar === null ) return;

    var star  = ev.target;
    var diffX = star.scaleX - star.startScaleX;
    var diffY = star.scaleX - star.startScaleY;

    // Animates star's "step" property
    star.step = 1;
    star.animate( 'step', 0, {
        duration  : 500,
        easing    : function( currentTime, startValue, byValue, duration ) {
            // Custom easing function
            step      = fabric.util.ease.easeOutElastic(currentTime, startValue, byValue, duration); // Calculates step value using easing function
            star.step = step;
            star.shadow.blur   = 5 + 5 * step;
            star.shadow.offset = { x: 5 + 10 * step, y: 5 + 10 * step };
            star.scaleX = star.startScaleX + diffX * step;
            star.scaleY = star.startScaleY + diffY * step;
        },
        onComplete: function() {
            /*star.shadow.offset = { x: 5, y: 5 };
            star.scaleX = star.startScaleX;
            star.scaleY = star.startScaleY;
            currentStar = null;
            star.step   = 0;*/
            currentStar = null;
        }
    } );
}
