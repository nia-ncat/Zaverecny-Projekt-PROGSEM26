
const ukuleleStrings = [
    { name: "G4", frek: 392.00 },
    { name: "C4", frek: 261.63 },
    { name: "E4", frek: 329.63 },
    { name: "A4", frek: 440.00 }
];

const guitarStrings = [
    { name: "E2", frek: 82.41 },
    { name: "A2", frek: 110.00 },
    { name: "D3", frek: 146.83 },
    { name: "G3", frek: 196.00 },
    { name: "B3", frek: 246.94 },
    { name: "E4", frek: 329.63 }
];

let audioContext;
let anal; //analyzator


// tlacitko
document.getElementById("startBtn")
    .addEventListener("click", spustitLadicku);

// text
document.getElementById("instrument")
    .addEventListener("change", () => {

        document.getElementById("currentInstrument")
            .innerText =
            document.getElementById("instrument").value;
    });

function ziskatStruny() {

    const instrument =
        document.getElementById("instrument").value;

    if (instrument === "kytara") {
        return guitarStrings;
    }

    return ukuleleStrings;
}

async function spustitLadicku() {

    const stream =
        await navigator.mediaDevices.getUserMedia({
            audio: true
        });

    audioContext = new AudioContext();

    const source =
        audioContext.createMediaStreamSource(stream);

    anal=
        audioContext.createAnalyser();

    anal.fftSize = 2048;

    source.connect(anal);

    aktualizovatTon();
}


function aktualizovatTon() {

    const bufferLength =
        anal.fftSize;

    const buffer =
        new Float32Array(bufferLength);

    anal.getFloatTimeDomainData(buffer);

    const frek =
        vypocitatAutokorelaci(
            buffer,
            audioContext.sampleRate
        );

    if (frek !== -1) {

        document.getElementById("frekvence")
            .innerText =
            frek.toFixed(2) + " Hz";

        const nearest =
            najitNejblizsiStrunu(frek);

        document.getElementById("nota")
            .innerText =
            nearest.name;

        const difference =
            frek - nearest.frek;

        let status;

        if (Math.abs(difference) < 1) {

            status = "naladeno";
        }
        else if (difference < 0) {

            status = "nedoladeno";
        }
        else {

            status = "preladeno";
        }

        document.getElementById("status")
            .innerText = status;
    }

    requestAnimationFrame(
        aktualizovatTon
    );
}

function najitNejblizsiStrunu(frek) {

    const strings =
        ziskatStruny();

    let nearest =
        strings[0];

    let minDifference =
        Math.abs(
            frek -
            strings[0].frek
        );

    for (let s of strings) {

        const difference =
            Math.abs(
                frek - s.frek
            );

        if (difference < minDifference) {

            minDifference = difference;
            nearest = s;
        }
    }

    return nearest;
}

const difference =
    frek - nearest.frek;

const maxOffset = 100;

let offset =
    Math.max(
        -maxOffset,
        Math.min(maxOffset, difference * 10)
    );

document.getElementById("needle")
    .style.left =
    `calc(50% + ${offset}px)`;

document.querySelectorAll(".string-btn")
    .forEach(btn =>
        btn.classList.remove("active"));

const activeBtn =
    document.querySelector(
        `[data-note="${nearest.name}"]`
    );

if (activeBtn)
    activeBtn.classList.add("active");

function vypocitatAutokorelaci(
    buffer,
    sampleRate
) {

    let SIZE =
        buffer.length;

    let rms = 0;

    // vypocet hlasitosti signalu
    for (let i = 0; i < SIZE; i++) {

        rms +=
            buffer[i] *
            buffer[i];
    }

    rms =
        Math.sqrt(
            rms / SIZE
        );

    // signal je slaby
    if (rms < 0.01) {

        return -1;
    }

    let bestPosun = -1;
    let bestCorrelation = 0;

    // hleda opakovani vlny
    for (
        let posun = 20;
        posun < 1000;
        posun++
    ) {

        let correlation = 0;

        for (
            let i = 0;
            i < SIZE - posun;
            i++
        ) {

            correlation +=
                buffer[i] *
                buffer[i + posun];
        }

        // ulozi nejlepsi
        if (
            correlation >
            bestCorrelation
        ) {

            bestCorrelation =
                correlation;

            bestPosun =
                posun;
        }
    }

    if (bestPosun === -1) {

        return -1;
    }

    return sampleRate / bestPosun;
}