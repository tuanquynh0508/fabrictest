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
