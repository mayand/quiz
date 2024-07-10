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
                displayQuestion(window.currentQuestionIndex); // Display the first question
            })
            .catch(error => console.error('Error fetching questions:', error));
    }
});

function displayQuestion(index) {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = ''; // Clear previous question

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
        form.appendChild(document.createElement('br'));
    });

    questionDiv.appendChild(form);

    const button = document.createElement('button');
    button.textContent = 'Submit';
    button.onclick = (e) => {
        e.preventDefault();
        checkAnswer(index + 1, question.correct);
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

function checkAnswer(questionNumber, correctAnswer) {
    const selectedAnswer = document.querySelector(`input[name="q${questionNumber}"]:checked`);
    const feedbackElement = document.getElementById(`feedback${questionNumber}`);

    if (selectedAnswer) {
        const explanation = window.questions[questionNumber - 1].explanation;
        if (selectedAnswer.value === correctAnswer) {
            feedbackElement.textContent = `Correct! ${explanation}`;
            feedbackElement.className = 'feedback correct';
        } else {
            feedbackElement.textContent = `Incorrect. ${explanation}`;
            feedbackElement.className = 'feedback incorrect';
        }
    } else {
        feedbackElement.textContent = "Please select an answer.";
        feedbackElement.className = 'feedback incorrect';
    }
}

function nextQuestion() {
    if (window.currentQuestionIndex < window.questions.length - 1) {
        window.currentQuestionIndex++;
        displayQuestion(window.currentQuestionIndex);
    }
}

function prevQuestion() {
    if (window.currentQuestionIndex > 0) {
        window.currentQuestionIndex--;
        displayQuestion(window.currentQuestionIndex);
    }
}
