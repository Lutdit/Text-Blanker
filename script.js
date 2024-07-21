document.addEventListener('DOMContentLoaded', function() {
    const inputText = document.getElementById('inputText');
    const blankButton = document.getElementById('blankButton');
    const blankedContent = document.getElementById('blankedContent');
    const transferButton = document.getElementById('transferButton');
    const transferredText = document.getElementById('transferredText');
    const checkAnswersButton = document.getElementById('checkAnswersButton');
    const checkResults = document.getElementById('checkResults');
    const scoreDisplay = document.getElementById('score');
    const AnswerSavePDF = document.getElementById('saveToPDFANS');
    const QuestionSaveDOCS = document.getElementById('saveToDOCS');
    let originalText = '';
    let blankedWords = [];
    let correctAnswers = [];

    blankButton.addEventListener('click', function() {
        const text = inputText.value;
        const words = text.split(/(\s+)/); // Split text into words and keep whitespace

        // Store original text and positions of blanks
        originalText = text;
        blankedWords = words.map(word => ({ word, isBlanked: false }));

        // Generate HTML for blanked content
        const blankedHTML = words.map((word, index) => {
            if (word.trim() === '') {
                // If the word is only whitespace, return it as is
                return word.replace(/\n/g, '<br>'); // Replace newlines with <br>
            } else {
                // Otherwise, wrap the word in a span
                return `<span data-index="${index}">${word}</span>`;
            }
        }).join('');

        blankedContent.innerHTML = blankedHTML;

        // Add click event listener to each word
        const wordSpans = blankedContent.querySelectorAll('span');
        wordSpans.forEach(span => {
            span.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                const isBlanked = blankedWords[index].isBlanked;

                if (isBlanked) {
                    // Revert to original word
                    this.textContent = blankedWords[index].word;
                    blankedWords[index].isBlanked = false;
                    correctAnswers = correctAnswers.filter(word => word !== blankedWords[index].word.toLowerCase());
                } else {
                    // Blank the word
                    const selectedWord = blankedWords[index].word;
                    blankedWords[index].isBlanked = true;
                    const blankedWord = '_'.repeat(selectedWord.length);
                    this.textContent = blankedWord;
                    correctAnswers.push(selectedWord.toLowerCase());
                }
            });
        });
    });

    transferButton.addEventListener('click', function() {
        let counter = 1; // Reset counter for numbering blanks
        const editedText = blankedWords.map((wordObj, index) => {
            if (wordObj.isBlanked) {
                return `<span class="blank-number">${counter++}.</span><input type="text" class="blank-input" data-index="${index}">`;
            } else {
                return wordObj.word;
            }
        }).join(' ');

        transferredText.innerHTML = editedText;
    });

    checkAnswersButton.addEventListener('click', function() {
        const userInputs = transferredText.querySelectorAll('.blank-input');
        let correctCount = 0;
        const totalBlanks = userInputs.length;

        userInputs.forEach((input, index) => {
            const userAnswer = input.value.trim().toLowerCase();
            const correctAnswerIndex = input.getAttribute('data-index');
            const correctAnswer = blankedWords[correctAnswerIndex].word.toLowerCase();

            if (userAnswer === correctAnswer) {
                input.classList.remove('incorrect');
                input.classList.add('correct');
                correctCount++;
            } else {
                input.classList.remove('correct');
                input.classList.add('incorrect');

                // Display the correct answer next to the input
                const correctAnswerDisplay = document.createElement('span');
                correctAnswerDisplay.textContent = `( ${blankedWords[correctAnswerIndex].word} )`;
                correctAnswerDisplay.classList.add('correct-answer');
                if (!input.nextElementSibling || !input.nextElementSibling.classList.contains('correct-answer')) {
                    input.parentNode.insertBefore(correctAnswerDisplay, input.nextSibling);
                }
            }
        });

        // Display the score
        scoreDisplay.textContent = `Score: ${correctCount} / ${totalBlanks}`;
    });

    AnswerSavePDF.addEventListener('click', function() {
        saveToPDF('#transferredText');
    });

    QuestionSaveDOCS.addEventListener('click', function() {
        saveToDOC('#blankedContent');
    });

    function saveToPDF(selector) {
        const { jsPDF } = window.jspdf;
        const elementToCapture = document.querySelector(selector);

        if (!elementToCapture) {
            console.error(`Element ${selector} not found.`);
            alert('Error: Element not found.');
            return;
        }

        html2canvas(elementToCapture).then(canvas => {
            const imgData = canvas.toDataURL('image/png');

            const doc = new jsPDF();
            const fileName = window.prompt('Enter a name for your PDF file (without extension):', 'text-blanker-results');
            if (!fileName) return; // Cancelled by user

            doc.text('Text Blanker Results', 10, 10);
            const score = document.getElementById('score').innerText;
            doc.text(score, 10, 20);

            const imgProps = doc.getImageProperties(imgData);
            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            doc.addImage(imgData, 'PNG', 10, 30, pdfWidth - 20, pdfHeight);

            doc.save(`${fileName}.pdf`);
        }).catch(error => {
            console.error('Error generating PDF:', error);
            alert('There was an error generating the PDF. Please try again.');
        });
    }

    function saveToDOC(selector) {
        const elementToCapture = document.querySelector(selector);
    
        if (!elementToCapture) {
            console.error(`Element ${selector} not found.`);
            alert('Error: Element not found.');
            return;
        }
    
        const fileName = window.prompt('Enter a name for your DOC file (without extension):', 'text-blanker-results');
        if (!fileName) return; // Cancelled by user
    
        const content = elementToCapture.innerText;
    
        const blob = new Blob([content], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.doc`;
        link.click();
    }  

});
