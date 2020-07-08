import MandelMaths from "./MandelMaths.js";

export const STATE_PENDING_RENDER = 1;
export const STATE_RENDERING = 2;
export const STATE_PENDING_CANCEL = 3;
export const STATE_CANCELLED = 4;
export const STATE_FINISHED = 5;
export default class MandelbrotCanvasElement extends HTMLElement {
	constructor(){
		super();
		this._width = 960;
		this._height = 720;
		this._x = -0.75;
		this._y = 0;
		this._zoom = 200;
		this._iterations = 2000;
		this.attachShadow({mode:"open"});
		this.shadowRoot.innerHTML = `
			<style>
				:host {
					display: block;
					position: relative;
					cursor: crosshair;
				}
				canvas {
					position: absolute;
					width: 100%;
					height: 100%;
				}
				#canvas-2 {
					display: none;
				}
			</style>
			<canvas id="canvas-1"></canvas>
			<canvas id="canvas-2"></canvas>
		`;
		/** @type {HTMLCanvasElement} */
		this._canvas1 = this.shadowRoot.getElementById("canvas-1");
		/** @type {HTMLCanvasElement} */
		this._canvas2 = this.shadowRoot.getElementById("canvas-2");
		this._ctx1 = this._canvas1.getContext("2d");
		this._ctx2 = this._canvas2.getContext("2d");
		this._lastScreenRefresh = Date.now();
		this.render();
	}

	/**
	 * Starts rendering the fractal after a short timeout and completes once the rendering process is finished or cancelled.
	 * 
	 * Will cancel the previous rendering process if it is still and already running, but just wait for it to complete if it has already been scheduled but not started yet.
	 */
	async render() {
		if (this._state===STATE_PENDING_RENDER){
			await this._finishRenderCallPromise;
		}else{
			if (this._state===STATE_RENDERING||this._state===STATE_PENDING_CANCEL){
				this._state = STATE_PENDING_CANCEL;
				await this._finishRenderCallPromise;
				await this.render();
			}else{
				this._state = STATE_PENDING_RENDER;
				let promise = this._finishRenderCallPromise = new Promise(async(resolve)=>{
					console.log("Queued Rendering!");
					let renderQueueTimeoutID = setTimeout(async()=>{
						await this._render();
						resolve();
					},0);
					this._cancelQueuedRendering = ()=>{
						clearTimeout(renderQueueTimeoutID);
						this._state = STATE_CANCELLED;
						resolve();
					};
				});
				await promise;
			}
		}
	}

	/**
	 * The actual rendering method. Immediately starts rendering regardless of current state.
	 */
	async _render(){
		this._state = STATE_RENDERING;
		console.log("Started Rendering!");
		let start = Date.now();
		this._canvas1.width = this._width;
		this._canvas1.height = this._height;
		this._canvas2.width = this._width;
		this._canvas2.height = this._height;
		this._pixels = new Uint32Array(this._width*this._height);
		this._imageData = new ImageData(new Uint8ClampedArray(this._pixels.buffer),this._width);
		await this._renderPart(64);
		await this._renderPart(16);
		await this._renderPart(4);
		await this._renderPart(1);
		this._refreshCanvas();
		if (this._state===STATE_PENDING_CANCEL){
			this._state = STATE_CANCELLED;
			console.log("Cancelled Rendering!");
		}else{
			this._state = STATE_FINISHED;
			console.log(`Finished Rendering in ${Math.floor((Date.now()-start)*10)/10}ms!`);
		}
	}

	async _renderPart(pixelSize){
		let x = (Math.round(this._width*0.5/pixelSize)-1)*pixelSize;
		let y = Math.round(this._height*0.5/pixelSize)*pixelSize;
		for (let i=0,r=Math.ceil(Math.max(this._width,this._height)*0.5/pixelSize);i<r*2&this._state===STATE_RENDERING;i+=2){
			for (let i2=0;i2<i;i2++){
				this._renderPixel(x,y,pixelSize);
				x -= pixelSize;
			}
			await this._waitForScreenRefresh();
			for (let i2=0;i2<i+1;i2++){
				this._renderPixel(x,y,pixelSize);
				y -= pixelSize;
			}
			await this._waitForScreenRefresh();
			for (let i2=0;i2<i+1;i2++){
				this._renderPixel(x,y,pixelSize);
				x += pixelSize;
			}
			await this._waitForScreenRefresh();
			for (let i2=0;i2<i+2;i2++){
				this._renderPixel(x,y,pixelSize);
				y += pixelSize;
			}
			await this._waitForScreenRefresh();
		}
	}

	_renderPixel(x,y,pixelSize){
		if (x+pixelSize>0&&y+pixelSize>0&&x<this._width&&y<this._height){
			let color = this.getPixelColor(Math.floor(x+pixelSize/2),Math.floor(y+pixelSize/2));
			if (pixelSize>1){
				this._ctx1.fillStyle = "#"+(((color>>>16)&0xff)+(((color>>>8)&0xff)<<8)+((color&0xff)<<16)).toString(16).padStart(6,0);
				this._ctx1.fillRect(x,y,pixelSize,pixelSize);
			}
		}
	}

	getPixelColor(x,y){
		let index = x+y*this._width;
		let cachedColor = this._pixels[index];
		if (cachedColor!=0){
			return cachedColor;
		}else{
			let cx = this._x+(x-this._width/2)/this._zoom;
			let cy = this._y+(y-this._height/2)/this._zoom;
			let maxIterations = this._iterations;
			let i = MandelMaths.iterate(cx,cy,{maxIterations});
			let color = (i==maxIterations?0:Math.floor(255.999*i/maxIterations)+(Math.floor(175.999*i/maxIterations)<<8))+0xff000000;
			this._pixels[index] = color;
			return color;
		}
	}

	async _waitForScreenRefresh(){
		if (Date.now()-this._lastScreenRefresh>100){
			this._refreshCanvas();
			await new Promise((resolve)=>{
				requestAnimationFrame(resolve);
			});
			this._lastScreenRefresh = Date.now();
		}
	}

	_refreshCanvas(){
		this._ctx2.putImageData(this._imageData,0,0);
		this._ctx1.drawImage(this._canvas2,0,0,this._width,this._height);
	}

	get canvas(){
		return this._canvas2;
	}

	get state(){
		return this._state;
	}

	set x(x){
		this._x = x;
		this.render();
	}

	get x(){
		return this._x;
	}

	set y(y){
		this._y = y;
		this.render();
	}

	get y(){
		return this._y;
	}

	set zoom(zoom){
		this._zoom = zoom;
		this.render();
	}

	get zoom(){
		return this._zoom;
	}

	mouseXToFractalX(x){
		return this._x+(x/this.offsetWidth-0.5)*this._width/this._zoom;
	}

	mouseYToFractalY(y){
		return this._y+(y/this.offsetHeight-0.5)*this._height/this._zoom;
	}

	set width(width){
		this.setAttribute("width",width);
	}

	get width(){
		return this._width;
	}

	set height(height){
		this.setAttribute("height",height);
	}

	get height(){
		return this._height;
	}

	static get observedAttributes(){
		return ["width","height"];
	}

	attributeChangedCallback(name,oldValue,newValue){
		if (name==="width"){
			this._width = newValue*1;
			this.render();
		}else if (name=="height"){
			this._height = newValue*1;
			this.render();
		}
	}
}
customElements.define("mandelbrot-canvas-element",MandelbrotCanvasElement);