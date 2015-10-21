    var testi = {};
    var loaded = 1;

    function save() {
        'salvataggio del canvas su db con ajax.'
        canvas.deactivateAll().renderAll();
        var canvas_json = JSON.stringify(canvas);
        var canvas_svg = canvas.toSVG();
        //var canvas_png=canvas.toDataURL("image/png");
        //  ajax('none','../save_canvas.php','svg='+canvas_svg+'&json='+canvas_json+'&png='+encodeURIComponent(canvas_png),false);
        window.open('data:image/svg+xml,' + encodeURIComponent(canvas.toSVG()));
    }


    function ombrato() {
        var obj = canvas.getActiveObject();
        if (!obj) return;
        if (obj.shadow) {
            obj.shadow = null;
        } else {
            obj.setShadow({
                color: 'rgba(0,0,0,0.3)',
                blur: 10,
                offsetX: 10,
                offsetY: 10
            });
        }
        canvas.renderAll();
    };

    function sendBackwards() {
        var activeObject = canvas.getActiveObject();
        if (activeObject) {
            canvas.sendBackwards(activeObject);
        }
        canvas.renderAll();
    };

    function loadImage(path) {
        path = 'clipart_sample.png';
        fabric.Image.fromURL(path, function(oImg) {
            oImg.filters.push(new fabric.Image.filters.Multiply({
                color: 'rgb(241, 93, 34)'
            }));
            oImg.applyFilters();
            canvas.add(oImg);
            // console.debug(oImg);
        });
    }

    function cloneobj() {
        var activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type != 'path-group') {
            canvas.add(activeObject.clone());
        }
        if (activeObject && activeObject.type == 'path-group') {
            loadsvg(window.path_svg);
        }
    };

    function sendToBack() {
        var activeObject = canvas.getActiveObject();
        if (activeObject) {
            canvas.sendToBack(activeObject);
            canvas.renderAll();
        }
    };

    function grassetto() {
        var activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type == 'text') {
            if (activeObject.get('fontWeight') == 'bold') {
                activeObject.set('fontWeight', 'normal');
            } else {
                activeObject.set('fontWeight', 'bold');
            }
            canvas.renderAll();
        }
    };

    function italico() {
        var activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type == 'text') {
            if (activeObject.get('fontStyle') == 'italic') {
                activeObject.set('fontStyle', 'normal');
            } else {
                activeObject.set('fontStyle', 'italic');
            }
            canvas.renderAll();
        }
    };

    function sottolineato() {
        var activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type == 'text') {
            var cd = activeObject.get('textDecoration');
            if (cd == 'underline') activeObject.set('textDecoration', 'line-through');
            if (cd == 'line-through') activeObject.set('textDecoration', 'overline');
            if (cd == 'overline') activeObject.set('textDecoration', '');
            if (cd == '') activeObject.set('textDecoration', 'underline');
            canvas.renderAll();
        }
    };

    function flipy() {

    };

    function flipx() {
        var activeObject = canvas.getActiveObject();
        if (activeObject) {
            activeObject.set('flipX', !activeObject.get('flipX'));
            canvas.renderAll();
        }

    };

    function bringForward() {
        var activeObject = canvas.getActiveObject();
        if (activeObject) {
            canvas.bringForward(activeObject);
            canvas.renderAll();
        }

    };

    function bringtofront() {
        var activeObject = canvas.getActiveObject();
        if (activeObject) {
            canvas.bringToFront(activeObject);
            canvas.renderAll();
        }
    };

    function nocolor(id) {
        document.getElementById(id).value = 'none';
        var activeObject = canvas.getActiveObject();
        if (activeObject) {
            if (id == 'criempi') activeObject.fill = '';
            if (id == 'cbordo') activeObject.stroke = '';
            canvas.renderAll();
        }
    };

    function delete_active() {
        var activeObject = canvas.getActiveObject(),
            activeGroup = canvas.getActiveGroup();

        if (activeGroup) {
            var objectsInGroup = activeGroup.getObjects();
            canvas.discardActiveGroup();
            objectsInGroup.forEach(function(object) {
                canvas.remove(object);
            });
        } else if (activeObject) {
            canvas.remove(activeObject);
            if (activeObject.type == 'path-group') {
                deleta_colori(activeObject.num_loaded);
            }
        }
        canvas.renderAll();
    };

    function deleta_colori(numero) {
        var el = document.getElementById("colori_" + numero);
        document.getElementById('barracolori').removeChild(el);
    }

    function loadsvg(path) {
        var el = document.createElement("div");
        el.setAttribute('id', 'colori_' + loaded);

        var el2 = document.createElement("input");
        el2.setAttribute('type', 'radio');
        el2.checked = true;
        el2.setAttribute('id', 'radio_' + loaded);
        el2.setAttribute('name', 'radiocolori');
        el.appendChild(el2);
        document.getElementById('barracolori').appendChild(el);

        fabric.loadSVGFromURL('assets/' + path, function(objects, options) {
            var group = fabric.util.groupSVGElements(objects, options);
            group.set({
                left: 1,
                top: 1
            }).scaleToWidth(250);
            group.hasControls = group.hasBorders = true;
            group.num_loaded = loaded;
            canvas.add(group);
            console.debug(group);
            loaded++;
            canvas.on('mouse:down', function(e) {
                scegli_selezionato(e)
            });
        }, reviver);
    }

    function loadsvg2(path) {
        var el = document.createElement("div");
        el.setAttribute('id', 'colori_' + loaded);

        var el2 = document.createElement("input");
        el2.setAttribute('type', 'radio');
        el2.checked = true;
        el2.setAttribute('id', 'radio_' + loaded);
        el2.setAttribute('name', 'radiocolori');
        el.appendChild(el2);
        document.getElementById('barracolori').appendChild(el);
        fabric.loadSVGFromURL('assets/' + path, function(objects, options) {
            for (var i in objects) {
                canvas.add(objects[i]);
                //console.debug(objects[i]);
            }
            loaded++;
            canvas.on('mouse:down', function(e) {
                scegli_selezionato(e)
            });
        }, reviver);
    }


    function scegli_selezionato(e) {
        if (e.target) {
            //e.target = canvas.relatedTarget;
            if (e.target.stroke) {
                document.getElementById("cbordo2").style.backgroundColor = e.target.stroke.toString().substr(0, 7);
                document.getElementById("cbordo").setAttribute("style", "background-color:" + e.target.stroke.toString().substr(0, 7));
                document.getElementById("cbordo").value = e.target.stroke.toString().substr(1, 6);
            }
            if (e.target.fill) {
                document.getElementById("criempi2").setAttribute("style", "background-color:" + e.target.fill.toString().substr(0, 7));
                document.getElementById("criempi").setAttribute("style", "background-color:" + e.target.fill.toString().substr(0, 7));
                document.getElementById("criempi").value = e.target.fill.toString().substr(1, 6);
            }
        }
    }

    function reviver(element, object) {
        //console.debug(element); console.debug(object);
        var stringa = [],
            coloreH;
        if (object.fill instanceof fabric.Gradient) {} else if (object.fill) {
            //console.debug(fabric.gradientDefs)
            //var coloreH = colorToHex(object.fill);
            //console.debug(coloreH);
            stringa.push(object.fill.toString().toUpperCase() + "_" + loaded);
            object.ofill = object.fill.toString().toUpperCase() + "_" + loaded;

        }
        if (object.stroke != null) {
            stringa.push(object.stroke.toString().toUpperCase() + "_" + loaded);
            object.ostroke = object.stroke.toString().toUpperCase() + "_" + loaded;
        }
        object.id = element.getAttribute('id');
        for (stringaid in stringa) {
            var m_stringa = stringa[stringaid];
            if (m_stringa != "") {
                if (typeof(colors[m_stringa]) == 'undefined') {
                    creatasto(m_stringa);
                    objs[m_stringa] = new Array();
                    colors[m_stringa] = new jscolor.color(document.getElementById("c" + m_stringa), {});
                    colors[m_stringa].fromString(m_stringa);
                    colors[m_stringa].pickerClosable = true;
                    colors[m_stringa].onImmediateChange = 'applica_colore(this);';
                    colors[m_stringa].parent = document.getElementById("c" + m_stringa).parentNode;
                    colors[m_stringa].original = m_stringa;
                }
                objs[m_stringa].push(object);
            }
        }
    }

    function Load_CSS2(path) {
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = path;
        link.media = 'all';
        head.appendChild(link);
    }

    function precarica_font(font) {
        Load_CSS2('../fonts/' + font + '.css');
        document.getElementById('img_font').src = '../fonts/' + font + '-regular.ttf.png';
        //ajax('none','controlla_font.php','f='+font);
    }

    function add_rect() {
        var rect = new fabric.Rect({
            width: 30,
            height: 30,
            fill: '#FF0000',
            stroke: '#FF0000'
        });
        canvas.add(rect);
        //console.debug(rect);
    }

    function add_circle() {
        var circle = new fabric.Circle({
            radius: 30,
            fill: '#00FF00',
            stroke: '#00FF00',
            startAngle: 45,
            endAngle: 135
        });
        canvas.add(circle);
        var circle = new fabric.Circle({
            radius: 30,
            fill: '#00FF00',
            stroke: '#FF0000',
            startAngle: -135,
            endAngle: -45
        });
        canvas.add(circle);
        var circle = new fabric.Circle({
            radius: 30,
            fill: '#00FF00',
            stroke: '#0000FF',
            startAngle: 135,
            endAngle: 225
        });
        canvas.add(circle);
        var circle = new fabric.Circle({
            radius: 30,
            fill: '#00FF00',
            stroke: '#00FFFF',
            startAngle: -45,
            endAngle: 45
        });
        canvas.add(circle);
        // console.debug(circle);
    }

    function add_poly() {
        var polygon = new fabric.Polygon([{
            x: 15,
            y: 42
        }, {
            x: 155,
            y: 0
        }, {
            x: 135,
            y: 243
        }, {
            x: 3,
            y: 256
        }], {
            fill: '#0000FF',
            stroke: '#00FF00'
        });
        canvas.add(polygon);
        //console.debug(polygon);
    }

    function add_linea() {
        var line = new fabric.Line([0, 15, 15, 0], {
            fill: '#00FF00',
            stroke: '#00FF00',
            width: 100
        });
        canvas.add(line);
        var line2 = new fabric.Line([0, -15, -3, 40], {
            fill: '#00FF00',
            stroke: '#00FF00',
            height: 95
        });
        canvas.add(line2);
        //console.debug(line);
    }

    function add_text(testo, font, style, weight) {
        var text = new fabric.IText(testo, {
            fontFamily: font,
            fontSize: 36,
            fill: '#000000',
            stroke: '#000000'
        });
        canvas.add(text);
    }

    function add_Itext(testo) {
        testo = "bla bla prova";
        var text = new fabric.IText(testo, {
            fontSize: 36,
            fill: '#FF0000',
            stroke: '#00FF00'
        });
        canvas.add(text);
    }

    function add_path(path) {
        var path = new fabric.Path('M121.32,0L44.58,0C36.67,0,29.5,3.22,24.31,8.41\
c-5.19,5.19-8.41,12.37-8.41,20.28c0,15.82,12.87,28.69,28.69,28.69c0,0,4.4,\
0,7.48,0C36.66,72.78,8.4,101.04,8.4,101.04C2.98,106.45,0,113.66,0,121.32\
c0,7.66,2.98,14.87,8.4,20.29c5.42,5.42,12.62,8.4,20.28,8.4c7.66,0,14.87\
-2.98,20.29-8.4c0,0,28.26-28.25,43.66-43.66c0,3.08,0,7.48,0,7.48c0,15.82,\
12.87,28.69,28.69,28.69c7.66,0,14.87-2.99,20.29-8.4c5.42-5.42,8.4-12.62,8.4\
-20.28l0-76.74c0-7.66-2.98-14.87-8.4-20.29C136.19,2.98,128.98,0,121.32,0z', {
            left: 100,
            top: 100
        });
        canvas.add(path);
        var path = new fabric.Path('M121.32,0L44.58,0C36.67,0,29.5,3.22,24.31,8.41\
c-5.19,5.19-8.41,12.37-8.41,20.28c0,15.82,12.87,28.69,28.69,28.69c0,0,4.4,\
0,7.48,0C36.66,72.78,8.4,101.04,8.4,101.04C2.98,106.45,0,113.66,0,121.32\
c0,7.66,2.98,14.87,8.4,20.29c5.42,5.42,12.62,8.4,20.28,8.4c7.66,0,14.87\
-2.98,20.29-8.4c0,0,28.26-28.25,43.66-43.66c0,3.08,0,7.48,0,7.48c0,15.82,\
12.87,28.69,28.69,28.69c7.66,0,14.87-2.99,20.29-8.4c5.42-5.42,8.4-12.62,8.4\
-20.28l0-76.74c0-7.66-2.98-14.87-8.4-20.29C136.19,2.98,128.98,0,121.32,0z', {
            left: 200,
            top: 200
        });
        canvas.add(path);
        var path = new fabric.Path('M121.32,0L44.58,0C36.67,0,29.5,3.22,24.31,8.41\
c-5.19,5.19-8.41,12.37-8.41,20.28c0,15.82,12.87,28.69,28.69,28.69c0,0,4.4,\
0,7.48,0C36.66,72.78,8.4,101.04,8.4,101.04C2.98,106.45,0,113.66,0,121.32\
c0,7.66,2.98,14.87,8.4,20.29c5.42,5.42,12.62,8.4,20.28,8.4c7.66,0,14.87\
-2.98,20.29-8.4c0,0,28.26-28.25,43.66-43.66c0,3.08,0,7.48,0,7.48c0,15.82,\
12.87,28.69,28.69,28.69c7.66,0,14.87-2.99,20.29-8.4c5.42-5.42,8.4-12.62,8.4\
-20.28l0-76.74c0-7.66-2.98-14.87-8.4-20.29C136.19,2.98,128.98,0,121.32,0z', {
            left: 400,
            top: 400
        });
        canvas.add(path);
        /*
            var path = new fabric.Path('M0,0C36.67,0,29.5,3.22,0,100C36.67,0,29.5,3.22,0,300C36.67,0,29.5,3.22,-300,100');
            canvas.add(path);
            console.debug(path);
            var path = new fabric.Path('M100,100 A25 50 0 0 1 150 100 A25 50 90 0 1 150 150 A25 50 180 0 1 100 150 A25 50 270 0 1 100 100');
            console.debug(path);
            canvas.add(path);
            console.debug(path);*/
    }

    function applica_colore(obj) {
        obj.parent.style.backgroundColor = '#' + obj.toString();
        var tmpArray = objs[obj.original];
        for (var i = 0; i < tmpArray.length; i++) {
            if (tmpArray[i].ofill == obj.original) {
                tmpArray[i].fill = '#' + obj.toString();
            }
            if (tmpArray[i].ostroke == obj.original) {
                tmpArray[i].stroke = '#' + obj.toString();
            }
        }
        canvas.renderAll();
    }

    function applica_colore2(obj) {
        var el = document.getElementById("criempi2");
        el.style.backgroundColor = '#' + obj.toString();;
        var activeObject = canvas.getActiveObject();
        if (activeObject) {
            activeObject.fill = '#' + obj.toString();
        }
        canvas.renderAll();
    }

    function applica_colore3(obj) {
        var el = document.getElementById("cbordo2");
        el.style.backgroundColor = '#' + obj.toString();
        var activeObject = canvas.getActiveObject();
        if (activeObject) {
            activeObject.stroke = '#' + obj.toString();
        }
        canvas.renderAll();
    }

    function creatasto(colore) {
        var button = document.createElement("LABEL");
        button.setAttribute("for", "c" + colore);
        button.style.backgroundColor = colore.substr(0, 7);
        button.setAttribute("class", "button-color");
        var button2 = document.createElement("INPUT");
        button2.setAttribute("type", "text");
        button2.setAttribute("id", "c" + colore);
        button2.setAttribute("class", "color");
        button2.value = colore.substr(0, 7);
        button.appendChild(button2);
        document.getElementById('colori_' + loaded).appendChild(button);
    }

    function colorToHex(colore) {

        if (colore.substr(0, 1) === '#') {
            return colore;
        }
        var digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);

        var red = parseInt(digits[2]);
        var green = parseInt(digits[3]);
        var blue = parseInt(digits[4]);

        var rgb = blue | (green << 8) | (red << 16);
        return digits[1] + '#' + rgb.toString(16);
    }


    function testo2() {

        var text = new fabric.Text('hello world', {
            left: 0,
            top: 0,
            fontFamily: 'Helvetica',
            fontSize: 12,
            fill: 'black'
        });

        var rect = new fabric.Rect({
            left: -4,
            top: -2,
            width: text.width + 8,
            height: text.height + 4,
            rx: 3,
            ry: 3,
            fill: '#fff',
            stroke: '#F00',
            strokeWidth: 2
        });

        var group = new fabric.Group([rect, text], {
            left: 150,
            top: 50
        });

        canvas.add(group);
    }

    function gradienti() {
        var activeObject = canvas.getActiveObject();
        if (activeObject) {
            activeObject.setGradient('fill', {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: activeObject.height,
                colorStops: {
                    0: '#000',
                    0.5: '#fff',
                    1: '#00f'
                }
            });
            canvas.renderAll();
        }
    }
