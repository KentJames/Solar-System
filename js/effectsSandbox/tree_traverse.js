// This is a tester for recursively parsing through a JSON tree to define the objects for my scene.


// Load JSON file and parse it to an object.
var JSON_Request = new XMLHttpRequest();
JSON_Request.open("GET","./js/scene_description.json",false);
JSON_Request.send(null);
var my_JSON_object = JSON.parse(JSON_Request.responseText);
console.log(my_JSON_object);


function LogtoConsole(node){
    console.log(node.Name);
    return
}

function AppendtoBody(node){
    $('body').append('<div>' + node.Name)
}

function LogObjectProperties(node){
    
}

//A recursive depth-first search parse for my JSON tree! 
function RecursiveTreeParse(JsonTree,callback){
    var Children = JsonTree;
    
    //If Children is not null, then proceed.
    if(!Children){
        return
    }
    //Go through all children, if any, and recursively parse through them.
    for(var i = 0;i < Children.length;i++){

        RecursiveTreeParse(Children[i].Children,callback);
        if(typeof callback=='function')callback(Children[i]);

    }
}


//Parse through all children.
// Pass the tree that I parsed from the JSON file, and pass a callback function to operate on each element.
RecursiveTreeParse(my_JSON_object.Scene.Children,AppendtoBody);