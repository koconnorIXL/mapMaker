# mapMaker
Tool for generating maps

########## Modifying datasets ##########
In order to modify datasets in the code base, one must first trace back from which GeoJSON file the data is originating.
These steps are a little tricky.

First, take a look at mapMaker/scp_all.js and find which TopoJSON file and directory
in the Github repository corresponds to the TopoJSON file in the code base. Once you have that information, browse the
different CreateTopojson*.js files to find the Javascript file that generates the TopoJSON file that you found in the
previous step. In that Javascript file, you should be able to locate the GeoJSON file that it's parsing. Once you know
which file it is, you can modify that file to achieve the result that you want.

After modifying the GeoJSON, now you want to generate the TopoJSON file(s). To do this, run
'node <whichever CreateTopojson* file that you found>'
Next, you will need to copy these files to the code base. To do this, run
'node scp_all.js <env_name>'
e.g. 'node scp_all.js dev'

Dont' forget to commit these changes in both Github and the code base.
