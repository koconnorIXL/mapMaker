
In order to use the files in this folder, you will need:

  1) An svg with the following properties:

    a) It should represent a geographic map with a known projection. The js module
       GetProjectionForIllustrationSVG.js should return the projection which was
       used for the svg's underlying map.

    b) It should have extra features drawn on top of the map by an illustrator. The
       features should end up looking something like this in the svg.

       <svg>
         ALL THE UNDERLYING MAP STUFF
         <g id="Feature1">
           <path>s and <polygon>s to draw the new feature should be here
         </g>
         <g id="Feature2">
           <path>s and <polygon>s to draw the new feature should be here
         </g>
         ...
       </svg>


       If the new features are to spliced in to existing geographic datasets using the
       code in ../datasetSplicing, then it would be convenient for the features to be
       clockwise loops, rather than counter-clockwise. However, we have some simple 
       scripts, like GenerateMinAndReverseData.js, which can help with reversing
       orientation. So, this is not a strict requirement.

  2) A file called NewTerritoryPropMap.js which exports a js object of the form:

     {
       'Feature1': {
         name: 'Feature1',
         prop1: val1,
         prop2: val2,
         ...
       },
       ...
     }

     The keys in this object should match the ids in the svg. The values will become
     the properties of geojson features, whose geometries will be the features in the svg.
  
  3) A directory called geojsonDatasets in this current directory.


The main script in this directory is RunSVGParsingOnDisputedMap.js. Running this 
code will create a geojson file for each new <g> in the svg. The geojson files will 
be added to the geojsonDatasets directory. The geojson features will have
(longitude, latitude) coordinates.

NOTE: If you want to add the new features to an existing dataset, consider looking at
the code in ../datasetSplicing.

