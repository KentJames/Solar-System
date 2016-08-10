// This is a tester for recursively parsing through a JSON tree to define the objects for my scene.


// Load JSON file and parse it to an object.
var JSON_Request = new XMLHttpRequest();
JSON_Request.open("GET","./js/document-2.json",false);
JSON_Request.send(null);
var my_JSON_object = JSON.parse(JSON_Request.responseText);
console.log(my_JSON_object);


function LogtoConsole(data){
    console.log(data);
    return
}

function AppendtoBody(data){
    $('body').append('<div>' + data)
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
        if(typeof callback=='function')callback(Children[i].Name);

    }
}


//Parse through all children.
RecursiveTreeParse(my_JSON_object.Scene.Children,AppendtoBody);