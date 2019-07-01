const Camera = function(canvasElement){
	var exports = {};
	
	var position = new Vector3f(0,0,-5);
	var velocity = new Vector3f(0);
	var viewMatrix = new Matrix3f();
	var maxAcceleration = 0.0005;
	
	var keyDown = {};
	canvasElement.addEventListener("keydown",function(e){
		keyDown[e.key] = true;
	});
	canvasElement.addEventListener("keyup",function(e){
		keyDown[e.key] = false;
	});
	var locked = false;
	var cancelRightClick = false;
	canvasElement.addEventListener("click",function(){
		canvasElement.requestPointerLock();
	});
	document.addEventListener("pointerlockchange",function(){
		if (document.pointerLockElement==canvasElement){
			locked = true;
		}else{
			locked = false;
			canvasElement.blur();
		}
	});
	canvasElement.addEventListener("mousemove",function(e){
		if (locked){
			viewMatrix.rotate(e.movementY/10,e.movementX/10,0);
		}
	});
	canvasElement.addEventListener("mousedown",function(e){
		if (locked&&e.which==3){
			cancelRightClick = true;
			document.exitPointerLock();
		}
	});
	canvasElement.addEventListener("contextmenu",function(e){
		console.log("contextmenu event! cancelRightClick: "+cancelRightClick);
		if (cancelRightClick){
			cancelRightClick = false;
			e.preventDefault();
		}
	});
	
	exports.update = function(){
		var acceleration = new Vector3f(0,0,0);
		if (keyDown.a){
			acceleration.x -= maxAcceleration;
		}
		if (keyDown.d){
			acceleration.x += maxAcceleration;
		}
		if (keyDown.s){
			acceleration.z -= maxAcceleration;
		}
		if (keyDown.w){
			acceleration.z += maxAcceleration;
		}
		viewMatrix.apply(acceleration);
		velocity.scale(0.95);
		velocity.add(acceleration);
		position.add(velocity);
	};
	exports.setSpeed = function(speed){
		velocity.scale((speed/200)/maxAcceleration);
		maxAcceleration = speed/200;
	};
    exports.setPosition = function(pos){
        position = pos;
    };
	exports.getPosition = function(){
		return position;
	};
    exports.setViewMatrix = function(matrix){
        viewMatrix = matrix;
    };
	exports.getViewMatrix = function(){
		return viewMatrix;
	};
	
	return exports;
};