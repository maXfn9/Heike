
var SENSITIVITY = 0.2; // 0-1, with 1 being the strongest
const MAX_IN_MAX = 255; // Maximum value for inMax

const audioElement = document.getElementById('audiosource');

const audioContext = new AudioContext();
const track = audioContext.createMediaElementSource(audioElement);
const analyzer = audioContext.createAnalyser();

var gainNode = audioContext.createGain();
var lowpass = audioContext.createBiquadFilter();
var highpass = audioContext.createBiquadFilter();

let sliderOne = document.getElementById("slider-freq-1");
let sliderTwo = document.getElementById("slider-freq-2");

let sliderVFontOne = document.getElementById("slider-v-font-1");
let sliderVFontTwo = document.getElementById("slider-v-font-2");

var sliderSensitivity = document.getElementById("slider-sensitivity");
var sliderTransition = document.getElementById("slider-transition");

var lowerOutput = sliderVFontOne.value;
var upperOutput = sliderVFontTwo.value;


track.connect(analyzer);
analyzer.connect(lowpass);
lowpass.connect(highpass);
highpass.connect(gainNode);
gainNode.connect(audioContext.destination);

lowpass.type = "lowpass";
lowpass.frequency.value = audioContext.sampleRate / 2;
lowpass.gain.value = -1;
highpass.type = "highpass";
highpass.frequency.value = 0;
highpass.gain.value = -1;

audioElement.play();

const dataArray = new Uint8Array(analyzer.frequencyBinCount);

let animationId;

function mapValue(value, inMin, inMax, outMin, outMax) {
	return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

function animate() {
	// Aninmation logic goes here
	analyzer.getByteFrequencyData(dataArray);

	var SENSITIVITY = sliderSensitivity.value;

	lowpass.frequency.value = sliderTwo.value;
	highpass.frequency.value = sliderOne.value;

	var dynamicInMax = Math.max(MAX_IN_MAX * (1 - SENSITIVITY), 1);

	lowerOutput = sliderVFontOne.value;
	upperOutput = sliderVFontTwo.value;

	var lowerBound = (Math.floor(analyzer.frequencyBinCount/audioContext.sampleRate*sliderOne.value), 0);
	var upperBound = (Math.floor(analyzer.frequencyBinCount/audioContext.sampleRate*sliderTwo.value), analyzer.fftSize);

	let sum = dataArray.slice(lowerBound, upperBound).reduce((a, b) => a + b, 0);

	let average = sum / (upperBound-lowerBound);

	let weight = Math.max(Math.floor(mapValue(average, 0, dynamicInMax, lowerOutput, upperOutput)), sliderVFontOne.value);
	//			console.log(mapValue(average, 0, dynamicInMax, outMin, sliderVFontTwo.value));
	//	let ytas = Math.floor(mapValue(average2, SENSITIVITY, dynamicInMax, 100, 854));

	document.querySelector('.title').style.setProperty('--font-weight', weight);

	document.querySelector('.title').style.setProperty('--transition-duration', sliderTransition.value+'s');
	//	document.querySelector('.title').style.setProperty('--font-ytas', ytas);

	animationId = requestAnimationFrame(animate);

}

audioElement.onplay = () => {
	audioContext.resume();
	animationId = requestAnimationFrame(animate);
};

audioElement.onpause = () => {
	cancelAnimationFrame(animationId);
};

audioElement.onended = () => {
	cancelAnimationFrame(animationId);
};

window.onload = function () {
	lowerBound(sliderOne, sliderTwo, '', document.getElementById('range1'), '')
	upperBound(sliderOne, sliderTwo, '', document.getElementById('range2'), '')
};

sliderOne.max = lowpass.frequency.value;
sliderTwo.max = lowpass.frequency.value;
