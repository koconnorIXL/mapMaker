
This folder contains several files which should help with modifying geographic data.
Specifically, most of the code here is written to take large regions in a geographic
dataset and split off parts of those large regions into new, separate regions.

Concrete example:

  Suppose that the western half of Albania secedes from the rest of Albania, and we 
  want to modify our countries dataset so that there is a new feature entry for 
  Western Albania, and the Albania feature's boundary no longer includes Western
  Albania.

  Minimal Solution (for one-off requests):
    
    1) Create a geojson file containing a single feature, Western Albania. For guidance
       on how to create this dataset, see some of the code in ../svgParsing.

    2) Write a js module which does something like this:
         var fs = require('fs');
         
         var splicePaths = require('./SplicePaths.js');

         var westernAlbania = JSON.parse(fs.readFileSync(WESTERN_ALBANIA_GEOJSON_FILE));
         var countries = JSON.parse(fs.readFileSync(COUNTRIES_GEOJSON_FILE));
         
         var westernAlbaniaCoordinates = westernAlbania.features[0].geometry.coordinates;
         var albaniaCoordinates = ...;

         var newCoordinates = splicePaths(westernAlbaniaCoordinates, albaniaCoordinates);

         var newWesternAlbaniaCoordinates = newCoordinates[0];
         var newAlbaniaCoordinates = newCoordinates[1];

         // reset the coordinates of the Albania geometry
         ... = newAlbaniaCoordinates;

         westernAlbania.features[0].geometry.coordinates = newWesternAlbaniaCoordinates;
         countries.features.push(westernAlbania);
         
         fs.writeFileSync('tmp.json', JSON.stringify(countries, null, '  '));
         
         // Consider testing tmp.json with something like geojson.io or other IXL map code.
         // Assuming it looks good, then clobber our countries json file with this new one.
    
  Repeatable Solution (better for batches of new territories):

    Take a look at the code in SpliceAllDatasets.js. This code reads in a collection of
    territory names from NewTerritoryPropMap.js, and basically iterates through all of
    them and applies the 'Minimal Solution' described above. It assumes that geojson files
    have been created for all of the territories in NewTerritoryPropMap.

    A few philosophical notes on this method:
      
      1) While this method makes it easier to rapidly splice in batches of territories
         to our geographic datasets, the goal should be eventually to create a final
         new dataset which will clobber the old one.
         NewTerritoryPropMap (since they are already sliced into the dataset and don't
         need to be added anymore).

         Once we clobber the old dataset, the entries in NewTerritoryPropMap will become
         somewhat unnecessary, since the named territories will have already been added,
         but feel free to leave the old territory names. SpliceAllDatasets will skip any 
         territory names which are already in the old dataset.

      2) It is generally easy for our map front-end code to combine territories together. 
         It is tough to split territories apart. So, as a rule of thumb, it is a good
         idea to split territories apart. We could always create a map which uses the
         split territory's dataset, and add directives to merge some territories together
         and draw them as one solid region.

      

