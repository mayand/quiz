document.addEventListener("DOMContentLoaded", function() {
    const params = new URLSearchParams(window.location.search);
    const chapter = params.get('chapter');
    
    if (chapter) {
        const questionFile = `questions/questions_ch${chapter}.json`;
        fetch(questionFile)
            .then(response => response.json())
            .then(data => {
                window.questions = data; // Store the questions globally for access in navigation functions
                window.currentQuestionIndex = 0; // Initialize the current question index
                window.correctAnswers = 0; // Initialize the correct answers count
                window.incorrectAnswers = 0; // Initialize the incorrect answers count
                displayQuestion(window.currentQuestionIndex); // Display the first question
            })
            .catch(error => console.error('Error fetching questions:', error));
    }
});

function displayQuestion(index) {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = ''; // Clear previous question

    if (index >= window.questions.length) {
        displayResults();
        return;
    }

    const question = window.questions[index];
    const questionDiv = document.createElement('div');
    questionDiv.classList.add('question');
    questionDiv.id = `question${index + 1}`;
    
    const questionText = document.createElement('p');
    questionText.textContent = question.question;
    questionDiv.appendChild(questionText);

    const form = document.createElement('form');
    question.options.forEach((option, i) => {
        const label = document.createElement('label');
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `q${index + 1}`;
        radio.value = String.fromCharCode(97 + i); // Convert 0, 1, 2... to 'a', 'b', 'c'...
        label.appendChild(radio);
        label.appendChild(document.createTextNode(` ${String.fromCharCode(97 + i)}) ${option}`));
        form.appendChild(label);
    });

    questionDiv.appendChild(form);

    const button = document.createElement('button');
    button.textContent = 'Submit';
    button.onclick = (e) => {
        e.preventDefault();
        checkAnswer(index, question.correct);
    };
    questionDiv.appendChild(button);

    const feedbackDiv = document.createElement('div');
    feedbackDiv.classList.add('feedback');
    feedbackDiv.id = `feedback${index + 1}`;
    questionDiv.appendChild(feedbackDiv);

    quizContainer.appendChild(questionDiv);

    // Disable the "Previous" button if on the first question
    document.getElementById('prev-btn').disabled = (index === 0);

    // Disable the "Next" button if on the last question
    document.getElementById('next-btn').disabled = (index === window.questions.length - 1);
}

function checkAnswer(questionIndex, correctAnswer) {
    const selectedAnswer = document.querySelector(`input[name="q${questionIndex + 1}"]:checked`);
    const feedbackElement = document.getElementById(`feedback${questionIndex + 1}`);

    if (selectedAnswer) {
        const explanation = window.questions[questionIndex].explanation;
        if (selectedAnswer.value === correctAnswer) {
            feedbackElement.textContent = `Correct! ${explanation}`;
            feedbackElement.className = 'feedback correct';
            window.correctAnswers++;
        } else {
            feedbackElement.textContent = `Incorrect. ${explanation}`;
            feedbackElement.className = 'feedback incorrect';
            window.incorrectAnswers++;
        }
    } else {
        feedbackElement.textContent = "Please select an answer.";
        feedbackElement.className = 'feedback incorrect';
    }

    // Disable the submit button after answering
    feedbackElement.parentNode.querySelector('button').disabled = true;
}

function nextQuestion() {
    if (window.currentQuestionIndex < window.questions.length - 1) {
        window.currentQuestionIndex++;
        displayQuestion(window.currentQuestionIndex);
    } else {
        displayResults();
    }
}

function prevQuestion() {
    if (window.currentQuestionIndex > 0) {
        window.currentQuestionIndex--;
        displayQuestion(window.currentQuestionIndex);
    }
}

function displayResults() {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = ''; // Clear previous content

    const resultDiv = document.createElement('div');
    resultDiv.classList.add('result');

    const resultText = `
        <p>Total Questions: ${window.questions.length}</p>
        <p>Correctly Answered: ${window.correctAnswers}</p>
        <p>Incorrectly Answered: ${window.incorrectAnswers}</p>
    `;
    resultDiv.innerHTML = resultText;

    quizContainer.appendChild(resultDiv);

    // Hide navigation buttons
    document.getElementById('prev-btn').style.display = 'none';
    document.getElementById('next-btn').style.display = 'none';
}

function resetQuiz() {
    window.currentQuestionIndex = 0;
    window.correctAnswers = 0;
    window.incorrectAnswers = 0;
}
