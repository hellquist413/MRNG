const volumeMeter = document.getElementById('volume-meter');
const gainValueDisplay = document.getElementById('gain-value');
const measuredGainValueDisplay = document.getElementById('measured-gain-value');
const randomNumberDisplay = document.getElementById('random-number');
const copyRandomNumberButton = document.getElementById('copy-random-number');
const gainSlider = document.getElementById('gain-slider');

(async () => {
    const constraints = {
        audio: {
            echoCancellation: false,
            autoGainControl: false,
            noiseSuppression: false
        },
        video: false
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    const audioContext = new AudioContext();
    const mediaStreamAudioSourceNode = audioContext.createMediaStreamSource(stream);

    // Create a GainNode and set the gain value
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 100; // Set the gain value, e.g., 2 for doubling the volume

    // Update the gain value display
    gainValueDisplay.textContent = gainNode.gain.value;

    // Connect the mediaStreamAudioSourceNode to the gainNode
    mediaStreamAudioSourceNode.connect(gainNode);

    const analyserNode = audioContext.createAnalyser();
    // Connect the gainNode to the analyserNode
    gainNode.connect(analyserNode);

    function updateRandomNumber(measuredGainValue) {
        const randomNumber = Math.floor((Math.random() * measuredGainValue) % 10);
        randomNumberDisplay.textContent = randomNumber;
    }

    setInterval(() => {
        const measuredGainValue = parseFloat(measuredGainValueDisplay.textContent);
        updateRandomNumber(measuredGainValue);
    }, 1000);



    const pcmData = new Float32Array(analyserNode.fftSize);
    const onFrame = () => {
        analyserNode.getFloatTimeDomainData(pcmData);
        let sumSquares = 0.0;
        for (const amplitude of pcmData) { sumSquares += amplitude * amplitude; }
        const rmsValue = Math.sqrt(sumSquares / pcmData.length);
        volumeMeter.value = rmsValue;

        // Update the volume-meter background color based on the current volume
        volumeMeter.style.setProperty('--volume-percent', (rmsValue * 100) + '%');


        // Calculate the measured gain value
        const measuredGainValue = rmsValue / (1 / gainNode.gain.value);
        measuredGainValueDisplay.textContent = measuredGainValue.toFixed(4);

        window.requestAnimationFrame(onFrame);
    };

    window.requestAnimationFrame(onFrame);

    gainSlider.addEventListener('input', () => {
        const newGainValue = parseFloat(gainSlider.value);
        gainNode.gain.value = newGainValue;
        gainValueDisplay.textContent = newGainValue;
    });

    copyRandomNumberButton.addEventListener('click', () => {
        const randomNumber = randomNumberDisplay.textContent;
        navigator.clipboard.writeText(randomNumber).then(() => {
            console.log('Random number copied to clipboard:', randomNumber);
        }).catch((error) => {
            console.error('Failed to copy random number:', error);
        });
    });
})();
