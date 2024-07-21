let originalWords = [];
let totalBlanks = 0;

function blankOutWords() {
    const text = document.getElementById('inputText').value;
    const numBlanks = parseInt(document.getElementById('numBlanks').value, 10);
    if (isNaN(numBlanks) || numBlanks <= 0) {
        alert('Please enter a valid number of words to blank out.');
        return;
    }

    const words = text.split(' ');
    if (numBlanks >= words.length) {
        alert('The number of words to blank out is greater than or equal to the number of words in the text.');
        return;
    }

    originalWords = [...words];
    totalBlanks = numBlanks;
    const indices = new Set();
    while (indices.size < numBlanks) {
        const randomIndex = Math.floor(Math.random() * words.length);
        indices.add(randomIndex);
    }

    let blankCounter = 1;
    const blankedWords = words.map((word, index) => {
        if (indices.has(index)) {
            return `<span class="numbered-blank" data-number="${blankCounter++}"><input type="text" data-index="${index}" class="blank" /></span>`;
        }
        return word;
    });
    document.getElementById('outputText').innerHTML = blankedWords.join(' ');
    document.getElementById('scoreDisplay').textContent = '';
}

function checkAnswers() {
    const inputs = document.querySelectorAll('.blank');
    let correctCount = 0;
    inputs.forEach(input => {
        const index = parseInt(input.getAttribute('data-index'), 10);
        if (input.value.toLowerCase() === originalWords[index].toLowerCase()) {
            input.classList.add('correct');
            input.classList.remove('incorrect');
            input.nextElementSibling?.remove(); // Remove any existing correct-answer span
            correctCount++;
        } else {
            input.classList.add('incorrect');
            input.classList.remove('correct');
            if (!input.nextElementSibling) {
                const correctAnswer = document.createElement('span');
                correctAnswer.className = 'correct-answer';
                correctAnswer.textContent = originalWords[index];
                input.insertAdjacentElement('afterend', correctAnswer);
            }
        }
    });
    document.getElementById('scoreDisplay').textContent = `Score: ${correctCount} / ${totalBlanks}`;
}
