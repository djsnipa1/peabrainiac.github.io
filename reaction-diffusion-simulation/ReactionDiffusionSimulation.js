export default class ReactionDiffusionSimulation {

	constructor(width=480,height=360){
		this._width = width;
		this._height = height;
		this._speed = 1;
		this._diffusionA = 0.75;
		this._diffusionB = 0.75;
		this._growthRateA = 0.0258;
		this._deathRateB = 0.0523;
		this._grid = new Float64Array(width*height*2);
		for (let i=0;i<this._grid.length;i++){
			this._grid[i] = Math.random()*Math.random();
		}
		this._prevGrid = new Float64Array(this._grid);
	}

	update(){
		const nextGrid = this._prevGrid;
		const prevGrid = this._grid;
		const speed = this._speed;
		const diffusionA = this._diffusionA;
		const diffusionB = this._diffusionB; 
		const growthRateA = this._growthRateA;
		const deathRateB = this._deathRateB;
		for (let x=1,w=this._width-1;x<w;x++){
			for (let y=1,h=this._height-1;y<h;y++){
				let i = (x+y*this._width)*2;
				let a = prevGrid[i];
				let b = prevGrid[i+1];
				let averageA = (prevGrid[i+2]+prevGrid[i-2]+prevGrid[i+this._width*2]+prevGrid[i-this._width*2])*0.2+(prevGrid[i+this._width*2+2]+prevGrid[i-this._width*2+2]+prevGrid[i+this._width*2-2]+prevGrid[i-this._width*2-2])*0.05;
				let averageB = (prevGrid[i+3]+prevGrid[i-1]+prevGrid[i+this._width*2+1]+prevGrid[i-this._width*2+1])*0.2+(prevGrid[i+this._width*2+3]+prevGrid[i-this._width*2+3]+prevGrid[i+this._width*2-1]+prevGrid[i-this._width*2-1])*0.05;
				nextGrid[i] = a+((averageA-a)*diffusionA-a*b*b+growthRateA*(1-a))*speed;
				nextGrid[i+1] = b+((averageB-b)*diffusionB+a*b*b-(deathRateB+growthRateA)*b)*speed;
			}
		}
		console.log("new Grid:",nextGrid);
		this._grid = nextGrid;
		this._prevGrid = prevGrid;
	}

	render(){
		let imageData = new ImageData(this._width,this._height);
		for (let i=0,l=this._width*this._height;i<l;i++){
			let c = this._grid[i*2+1]*256;
			imageData.data[i*4] = c;
			imageData.data[i*4+1] = c;
			imageData.data[i*4+2] = c;
			imageData.data[i*4+3] = 255;
		}
		return imageData;
	}

	get width(){
		return this._width;
	}

	get height(){
		return this._height;
	}

}