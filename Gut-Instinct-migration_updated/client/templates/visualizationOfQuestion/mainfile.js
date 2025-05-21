// import './gaVisualization.html';
import { Template } from 'meteor/templating';

// CSS insertion script
Template.gaVisualization.onRendered(function() {
  if (document.querySelector("#emperor-css") === null) {
    document.querySelector("head").insertAdjacentHTML("beforeend", [
      '<link id="emperor-css" rel="stylesheet" type="text/css" href="css/emperor.css">',
      '<link rel="stylesheet" type="text/css" href="vendor/css/jquery-ui.min.css">',
      '<link rel="stylesheet" type="text/css" href="vendor/css/slick.grid.min.css">',
      '<link rel="stylesheet" type="text/css" href="vendor/css/spectrum.min.css">',
      '<link rel="stylesheet" type="text/css" href="vendor/css/chosen.min.css">',
      '<link rel="stylesheet" type="text/css" href="vendor/css/jquery.contextMenu.min.css">'
    ]);
  }
  
  // Emperor Setup
  setupEmperor();
  
  // Shape Replacement Setup
  setTimeout(function() {
    setupShapeReplacement();
  }, 3000);
});

// Emperor Configuration
function setupEmperor() {
  // When running in the Jupyter notebook we've encountered version conflicts
  // with some dependencies. So instead of polluting the global require context,
  // we define a new context.
  var emperorRequire = require.config({
    'context': 'emperor',
    // the left side is the module name, and the right side is the path
    // relative to the baseUrl attribute, do NOT include the .js extension
    'paths': {
      /* jQuery */
      'jquery': 'vendor/js/jquery-2.1.4.min',
      'jqueryui': 'vendor/js/jquery-ui.min',
      'jquery_drag': 'vendor/js/jquery.event.drag-2.2.min',

      /* jQuery plugins */
      'chosen': 'vendor/js/chosen.jquery.min',
      'spectrum': 'vendor/js/spectrum.min',
      'position': 'vendor/js/jquery.ui.position.min',
      'contextmenu': 'vendor/js/jquery.contextMenu.min',

      /* other libraries */
      'underscore': 'vendor/js/underscore-min',
      'chroma': 'vendor/js/chroma.min',
      'filesaver': 'vendor/js/FileSaver.min',
      'blob': 'vendor/js/Blob',
      'canvastoblob': 'vendor/js/canvas-toBlob',
      'd3': 'vendor/js/d3.min',

      /* THREE.js and plugins */
      'three': 'vendor/js/three.min',
      'orbitcontrols': 'vendor/js/three.js-plugins/OrbitControls',
      'projector': 'vendor/js/three.js-plugins/Projector',
      'svgrenderer': 'vendor/js/three.js-plugins/SVGRenderer',
      'canvasrenderer': 'vendor/js/three.js-plugins/CanvasRenderer',
      'selectionbox': 'vendor/js/three.js-plugins/SelectionBox',
      'selectionhelper': 'vendor/js/three.js-plugins/SelectionHelper',

      /* SlickGrid */
      'slickcore': 'vendor/js/slick.core.min',
      'slickgrid': 'vendor/js/slick.grid.min',
      'slickformatters': 'vendor/js/slick.editors.min',
      'slickeditors': 'vendor/js/slick.formatters.min',
      'slickdataview': 'vendor/js/slick.dataview.min',

      /* Emperor's objects */
      'util': 'js/util',
      'model': 'js/model',
      'multi-model': 'js/multi-model',
      'view': 'js/view',
      'controller': 'js/controller',
      'draw': 'js/draw',
      'scene3d': 'js/sceneplotview3d',
      'shapes': 'js/shapes',
      'animationdirector': 'js/animate',
      'trajectory': 'js/trajectory',
      'uistate': 'js/ui-state',

      /* controllers */
      'abcviewcontroller': 'js/abc-view-controller',
      'viewcontroller': 'js/view-controller',
      'colorviewcontroller': 'js/color-view-controller',
      'visibilitycontroller': 'js/visibility-controller',
      'opacityviewcontroller': 'js/opacity-view-controller',
      'scaleviewcontroller': 'js/scale-view-controller',
      'shapecontroller': 'js/shape-controller',
      'axescontroller': 'js/axes-controller',
      'animationscontroller': 'js/animations-controller',

      /* editors */
      'shape-editor': 'js/shape-editor',
      'color-editor': 'js/color-editor',
      'scale-editor': 'js/scale-editor'
    },
    /*
       Libraries that are not AMD compatible need shim to declare their
       dependencies.
     */
    'shim': {
      'jquery_drag': {
        'deps': ['jquery', 'jqueryui']
      },
      'chosen': {
        'deps': ['jquery'],
        'exports': 'jQuery.fn.chosen'
      },
      'contextmenu' : {
        'deps': ['jquery', 'jqueryui', 'position']
      },
      'filesaver' : {
        'deps': ['blob']
      },
      'canvastoblob' : {
        'deps': ['blob']
      },
      'slickcore': ['jqueryui'],
      'slickgrid': ['slickcore', 'jquery_drag', 'slickformatters', 'slickeditors',
                    'slickdataview']
    }
  });

  emperorRequire(
    ["jquery", "model", "controller"],
    function($, model, EmperorController) {
      var DecompositionModel = model.DecompositionModel;

      var div = $('#emperor-notebook-0xab88f06e');

      var data;
      
      var plot, biplot = null, ec;

      function init() {
        // Initialize the DecompositionModel for the scatter plot, and optionally
        // add one for the biplot arrows
        plot = new DecompositionModel(data.plot.decomposition,
                                      data.plot.metadata_headers,
                                      data.plot.metadata,
                                      data.plot.type);

        if (data.biplot) {
          biplot = new DecompositionModel(data.biplot.decomposition,
                                          data.biplot.metadata_headers,
                                          data.biplot.metadata,
                                          data.biplot.type);
        }

        ec = new EmperorController(plot, biplot, "emperor-notebook-0xab88f06e", undefined,
                                   data.info);
      }

      function animate() {
        requestAnimationFrame(animate);
        ec.render();
      }
      
      $(window).resize(function() {
        ec.resize(div.innerWidth(), div.innerHeight());
      });

      $(function(){
        init();
        animate();

        ec.ready = function () {
          // any other code that needs to be executed when emperor is loaded should
          // go here
          ec.loadConfig(data.plot.settings);

          // sets up generic callbacks for 3rd party consumers
          var plotView = ec.sceneViews[0];
          
          // Set the metadata field to 'age' for coloring
          setTimeout(function() {
            // HANDLE COLORING BY AGE
            if (ec.controllers && ec.controllers.color) {
              var colorController = ec.controllers.color;
              
              // First check if 'age' is available in the dropdown
              var colorSelect = colorController.$select[0];
              var hasAge = false;
              
              for (var i = 0; i < colorSelect.options.length; i++) {
                if (colorSelect.options[i].value === 'age') {
                  hasAge = true;
                  colorSelect.selectedIndex = i;
                  
                  // Trigger change event to apply the selection
                  $(colorSelect).trigger('change');
                  console.log('Auto-selected age for coloring');
                  break;
                }
              }
              
              if (!hasAge) {
                console.log('Age category not found in available metadata');
              }
              
              // Custom colors for age ranges
              var customColors = {
                0: '#1f77b4', // blue
                1: '#2ca02c', // green
                2: '#ffff00', // yellow
                3: '#ff7f0e', // orange
                4: '#d62728' // red
              };
              
              // Attempt to set custom colors if the editor exists
              if (colorController.colorEditor) {
                // Try to set colors for each value
                for (var value in customColors) {
                  colorController.colorEditor.setValueColor(value, customColors[value]);
                }
              }
            }
            
            // RENAME AXIS LABELS
            function renameAxisLabels() {
              // Method 1: Look for text elements in the SVG renderer
              var allText = document.querySelectorAll('text');
              for (var i = 0; i < allText.length; i++) {
                var text = allText[i].textContent || allText[i].innerText;
                if (text.match(/Axis 1/i) || text.match(/Axis 1/i)) {
                  allText[i].textContent = text.replace(/Axis 1/i, 'Axis 1').replace(/Axis 1/i, 'Axis 1');
                }
                if (text.match(/Axis 2/i) || text.match(/Axis 2/i)) {
                  allText[i].textContent = text.replace(/Axis 2/i, 'Axis 2').replace(/Axis 2/i, 'Axis 2');
                }
                if (text.match(/Axis 3/i) || text.match(/Axis 3/i)) {
                  allText[i].textContent = text.replace(/Axis 3/i, 'Axis 3').replace(/Axis 3/i, 'Axis 3');
                }
              }
            }
            
            // Run the axis renaming function repeatedly
            renameAxisLabels();
            
            var renameInterval = setInterval(renameAxisLabels, 500);
            
            // Stop trying after 10 seconds
            setTimeout(function() {
              clearInterval(renameInterval);
            }, 10000);
          }, 1000);
        }
      });
    }); // END REQUIRE.JS block
}

// Shape replacement code
function setupShapeReplacement() {
  // Map of shape names to THREE.js geometry creation functions
  const SHAPE_GEOMETRIES = {
    'Cone': function() {
      return new THREE.ConeGeometry(0.5, 1, 8);
    },
    'Sphere': function() {
      return new THREE.SphereGeometry(0.5, 16, 16);
    },
    'Star': function() {
      // Create a star shape
      const starShape = new THREE.Shape();
      const outerRadius = 0.5;
      const innerRadius = 0.2;
      const spikes = 5;
      
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (Math.PI * 2 * i) / (spikes * 2);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        if (i === 0) {
          starShape.moveTo(x, y);
        } else {
          starShape.lineTo(x, y);
        }
      }
      starShape.closePath();
      
      const extrudeSettings = {
        depth: 0.2,
        bevelEnabled: false
      };
      
      return new THREE.ExtrudeGeometry(starShape, extrudeSettings);
    },
    'Cylinder': function() {
      return new THREE.CylinderGeometry(0.4, 0.4, 0.8, 16);
    }
  };

  // Function to directly replace geometries in THREE.js scene
  function replaceGeometries() {
    // Accessing Emperor's controller
    if (typeof empObj === 'undefined' || !empObj.sceneViews || !empObj.sceneViews[0]) {
      console.log("Emperor or scene view not available yet");
      return false;
    }
    
    const sceneView = empObj.sceneViews[0];
    const scene = sceneView.scene;
    const metadata = window.data.plot.metadata;
    const metadataHeaders = window.data.plot.metadata_headers;
    
    // Find height_bins index in metadata
    let heightBinsIndex = -1;
    for (let i = 0; i < metadataHeaders.length; i++) {
      if (metadataHeaders[i] === 'height_bins') {
        heightBinsIndex = i;
        break;
      }
    }
    
    if (heightBinsIndex === -1) {
      console.log("height_bins field not found in metadata");
      return false;
    }
    
    // Create a map from sample ID to height_bins value
    const sampleToHeightBin = {};
    for (const sampleId in metadata) {
      if (metadata.hasOwnProperty(sampleId)) {
        sampleToHeightBin[sampleId] = metadata[sampleId][heightBinsIndex];
      }
    }
    
    // Map height_bins values to shape types
    const heightBinToShape = {
      'height_bin1': 'Cone',
      'height_bin2': 'Star',
      'height_bin3': 'Cylinder',
      'height_bin4': 'Sphere'
    };
    
    // Go through all objects in the scene
    let pointsReplaced = false;
    
    try {
      // First, try to replace THREE.Points with individual meshes
      for (let i = 0; i < scene.children.length; i++) {
        const child = scene.children[i];
        
        if (child instanceof THREE.Points) {
          console.log("Found points object:", child);
          
          // Get the positions from the points
          const positions = child.geometry.attributes.position.array;
          const colors = child.geometry.attributes.color.array;
          const count = child.geometry.attributes.position.count;
          
          // Create a parent object to hold our meshes
          const meshesParent = new THREE.Object3D();
          meshesParent.name = "CustomShapesContainer";
          
          // Get sample IDs if available
          let sampleIds = [];
          if (sceneView.decomp && sceneView.decomp.plottable && sceneView.decomp.plottable.sample_ids) {
            sampleIds = sceneView.decomp.plottable.sample_ids;
          }
          
          // Replace points with appropriate geometries
          for (let j = 0; j < count; j++) {
            const x = positions[j * 3];
            const y = positions[j * 3 + 1];
            const z = positions[j * 3 + 2];
            
            const r = colors[j * 3];
            const g = colors[j * 3 + 1];
            const b = colors[j * 3 + 2];
            
            // Determine which shape to use based on sample ID and height_bins
            let shapeName = 'Sphere'; // Default
            
            if (j < sampleIds.length) {
              const sampleId = sampleIds[j];
              const heightBin = sampleToHeightBin[sampleId];
              
              if (heightBin && heightBinToShape[heightBin]) {
                shapeName = heightBinToShape[heightBin];
              }
            }
            
            // Create geometry based on shape type
            const geometryFunc = SHAPE_GEOMETRIES[shapeName];
            if (!geometryFunc) continue;
            
            const geometry = geometryFunc();
            const material = new THREE.MeshBasicMaterial({
              color: new THREE.Color(r, g, b),
              transparent: true,
              opacity: 0.8
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x, y, z);
            mesh.scale.set(0.3, 0.3, 0.3); // Adjust size as needed
            
            meshesParent.add(mesh);
          }
          
          // Add the new meshes and remove (or hide) the original points
          scene.add(meshesParent);
          child.visible = false; // Hide instead of remove to preserve original data
          
          pointsReplaced = true;
          console.log(`Replaced ${count} points with custom geometries`);
        }
      }
      
      // Force a redraw
      if (sceneView.needsUpdate !== undefined) {
        sceneView.needsUpdate = true;
      }
      
      // Also try to trigger Emperor's render function
      if (empObj.drawFrame) {
        empObj.drawFrame();
      }
      
      return pointsReplaced;
    } catch (e) {
      console.error("Error replacing geometries:", e);
      return false;
    }
  }

  // Try replace geometries with multiple attempts
  let attempts = 0;
  const maxAttempts = 20;
  
  function tryReplaceGeometries() {
    attempts++;
    console.log(`Attempt ${attempts} to replace geometries`);
    
    const success = replaceGeometries();
    
    if (success) {
      console.log("Successfully replaced geometries!");
    } else if (attempts < maxAttempts) {
      // Try again after a delay
      setTimeout(tryReplaceGeometries, 1000);
    } else {
      console.log(`Failed to replace geometries after ${maxAttempts} attempts`);
    }
  }
  
  // Start attempts to replace geometries
  tryReplaceGeometries();
}