function Node(data){
    this.data = data;
    this.parent = null;
    this.children = [];
};

function Tree_Obj(data){
    var node = new Node(data);
    this._root = node;
}

Tree.prototype.traverse_depthfirst = function(callback){

    (function recurse(currentNode) {
        // step 2
        for (var i = 0, length = currentNode.children.length; i < length; i++) {
            // step 3
            recurse(currentNode.children[i]);
        }
 
        // step 4
        callback(currentNode);
         
        // step 1
    })(this._root);
}


// Not entirely sure about this:
/*
Tree.prototype.traverseBF = function(callback) {
    var queue = [node];
     

 
 
 
    while(queue.length > 0){
        for (var i = 0, length = currentTree.children.length; i < length; i++) {
            queue.enqueue(currentTree.children[i]);
        }
 
        callback(currentTree);
        currentTree = queue.dequeue();
    }
}; */