const Popup = function(parentElement,titleText,width="auto",height="auto"){
    var exports = {};
    
    var box = document.createElement("div");
    var head = document.createElement("div");
    var body = document.createElement("div");
    box.className = "transform-centered box";
    box.style.width = (width=="auto")?"auto":width+"px";
    box.style.height = (height=="auto")?"auto":height+"px";
    head.className = "box-head";
    body.className = "box-body";
    box.appendChild(head);
    box.appendChild(body);
    parentElement.appendChild(box);
    
    var title = document.createTextNode(titleText);
    head.appendChild(title);
    
    exports.setType = function(type){
        box.classList.add("box-"+type);
    };
    exports.close = function(){
        box.parentElement.removeChild(box);
    };
    exports.addText = function(text){
        var textNode = document.createTextNode(text);
        body.appendChild(textNode);
    };
    exports.addButton = function(text,callback){
        var line = document.createElement("div");
        line.style.textAlign = "center";
        line.style.margin = "10px";
        var button = document.createElement("div");
        button.className = "button";
        button.style.width = "50%";
        button.style.display = "inline-block";
        var buttonText = document.createTextNode(text);
        button.appendChild(buttonText);
        line.appendChild(button);
        body.appendChild(line);
        button.addEventListener("click",callback);
    };
    exports.addCloseButton = function(){
    	exports.addButton("Close",exports.close);
    };
    exports.addCanvas = function(canvas){
    	var container = document.createElement("div");
    	container.style.margin = "20px";
    	container.style.textAlign = "center";
    	canvas.style.width = "100%";
    	canvas.style.boxShadow = "2px 2px 8px #000000";
    	container.appendChild(canvas);
    	body.appendChild(container);
    };
    exports.addImageOrCanvas = function(element){
    	var container = document.createElement("div");
    	container.style.margin = "20px";
    	container.style.textAlign = "center";
    	element.style.width = "100%";
    	element.style.boxShadow = "2px 2px 8px #000000";
    	container.appendChild(element);
    	body.appendChild(container);
    };
    exports.clear = function(){
        while(body.firstChild){
            body.firstChild.remove();
        }
    };
    exports.resize = function(width=Math.max(head.offsetWidth,body.offsetWidth),height=head.offsetHeight+body.offsetHeight){
        box.style.width = width+"px";
        box.style.height = height+"px";
    };
    
    return exports;
};