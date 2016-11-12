Important Files in here:

SVGPathToLatitudeLongitude.js
  Reads an svg and converts new paths into GeoJSON files. Stores
  several new files for each new territory in the geojsonDatasets
  directory. Relies on the projection stored in 
  GetProjectionUsedForIllustration.js, which must have the same
  settings as the projection that was used to create the map svg.
  Has some hard-coded filenames.

SpliceAllDatasets.js
  Reads a high-res version of the countries dataset into memory,
  then splices in new territories from the datasets stored in
  the geojsonDatasets directory. Relies on SplicePaths.js to
  merge one new region into a larger region that used to subsume
  it. Outputs a new version of the high-res countries dataset
  into countries_high_res-tmp.json.

  After running SpliceAllDatasets.js, it is recommended that you
  move the new json file into ../geojsonDatasets and convert it
  to topojson using ../CreateTopojsonDatasets_countries.js.
