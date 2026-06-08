document.addEventListener("DOMContentLoaded", () => {
    const cfg = window.tunerConfig;
    if (!cfg || !Array.isArray(cfg.strings) || cfg.strings.length === 0) return;

    const strings = cfg.strings;

    const startBtn = document.getElementById("startBtn");
    const noteName = document.getElementById("noteName");
    const noteFreq = document.getElementById("noteFreq");
    const frequencyText = document.getElementById("frequencyText");
    const statusText = document.getElementById("statusText");
    const needle = document.getElementById("needle");

    let audioContext = null;
    let analyser = null;
    let mediaStream = null;
    let running = false;

    const first = strings[0];
    noteName.textContent = first.note;
    noteFreq.textContent = `(${first.freq.toFixed(2)} Hz)`;
    frequencyText.textContent = "Current frequency: -- Hz";
    statusText.textContent = "Press Start";
    updateNeedle(0);

    startBtn.addEventListener("click", startTuner);

    async function startTuner() {
        if (running) return;

        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            await audioContext.resume();

            const source = audioContext.createMediaStreamSource(mediaStream);
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;

            source.connect(analyser);

            running = true;
            startBtn.disabled = true;
            startBtn.textContent = "Listening...";
            loop();
        } catch (err) {
            statusText.textContent = "Microphone blocked or unavailable";
        }
    }

    function loop() {
        if (!analyser || !audioContext) return;

        const buffer = new Float32Array(analyser.fftSize);
        analyser.getFloatTimeDomainData(buffer);

        const frequency = autoCorrelate(buffer, audioContext.sampleRate);

        if (frequency !== -1) {
            const nearest = getNearestString(frequency);
            const cents = centsOffFromPitch(frequency, nearest.freq);

            noteName.textContent = nearest.note;
            noteFreq.textContent = `(${nearest.freq.toFixed(2)} Hz)`;
            frequencyText.textContent = `Current frequency: ${frequency.toFixed(2)} Hz`;

            if (Math.abs(cents) < 5) {
                statusText.textContent = "In tune";
                statusText.style.color = "#138a43";
            } else if (cents < 0) {
                statusText.textContent = "Flat";
                statusText.style.color = "#111";
            } else {
                statusText.textContent = "Sharp";
                statusText.style.color = "#111";
            }

            updateNeedle(cents);
        }

        requestAnimationFrame(loop);
    }

    function getNearestString(freq) {
        return strings.reduce((best, curr) => {
            return Math.abs(curr.freq - freq) < Math.abs(best.freq - freq) ? curr : best;
        });
    }

    function centsOffFromPitch(freq, refFreq) {
        return 1200 * Math.log2(freq / refFreq);
    }

    function updateNeedle(cents) {
        const maxCents = 50;
        const limited = Math.max(-maxCents, Math.min(maxCents, cents));
        const angle = (limited / maxCents) * 30;

        needle.style.transform = `translateX(-50%) rotate(${angle}deg)`;
    }

    function autoCorrelate(buffer, sampleRate) {
        let size = buffer.length;
        let rms = 0;

        for (let i = 0; i < size; i++) {
            rms += buffer[i] * buffer[i];
        }

        rms = Math.sqrt(rms / size);
        if (rms < 0.01) return -1;

        let bestOffset = -1;
        let bestCorrelation = 0;
        let lastCorrelation = 1;

        for (let offset = 20; offset < 1000; offset++) {
            let correlation = 0;

            for (let i = 0; i < size - offset; i++) {
                correlation += buffer[i] * buffer[i + offset];
            }

            correlation = correlation / (size - offset);

            if (correlation > 0.9 && correlation > lastCorrelation) {
                if (correlation > bestCorrelation) {
                    bestCorrelation = correlation;
                    bestOffset = offset;
                }
            }

            lastCorrelation = correlation;
        }

        if (bestOffset === -1) return -1;
        return sampleRate / bestOffset;
    }
});