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
                window.incorrectQuestions = []; // Initialize the array to store incorrectly answered questions
                displayQuestion(window.currentQuestionIndex); // Display the first question
            })
            .catch(error => console.error('Error fetching questions:', error));
    }

    loadNotes(); // Load notes on page load if applicable
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
    questionText.textContent = `Question ${index + 1}: ${question.question}`;
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

    // Adjust the "Next" button for the last question
    const nextBtn = document.getElementById('next-btn');
    if (index === window.questions.length - 1) {
        nextBtn.textContent = 'Finish';
    } else {
        nextBtn.textContent = 'Next';
    }
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
            window.incorrectQuestions.push({
                question: window.questions[questionIndex].question,
                explanation: window.questions[questionIndex].explanation
            });
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

    let resultText = `
        <p>Total Questions: ${window.questions.length}</p>
        <p>Correctly Answered: ${window.correctAnswers}</p>
        <p>Incorrectly Answered: ${window.incorrectAnswers}</p>
    `;

    if (window.incorrectQuestions.length > 0) {
        resultText += `<h3>Incorrectly Answered Questions:</h3>`;
        window.incorrectQuestions.forEach((item, index) => {
            resultText += `<p>${index + 1}. ${item.question}</p><p><strong>Explanation:</strong> ${item.explanation}</p>`;
        });
    }

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
    window.incorrectQuestions = [];
}

function loadNotes() {
    fetch('ChapterNotes.json')
        .then(response => response.json())
        .then(data => {
            const notesList = document.getElementById('notes-list');
            notesList.innerHTML = ''; // Clear previous content

            data.Chapters.forEach((chapter, index) => {
                const chapterLink = document.createElement('li');
                const link = document.createElement('a');
                link.href = "#";
                link.textContent = chapter.ChapterTitle;
                link.onclick = () => displayNotes(index);
                chapterLink.appendChild(link);
                notesList.appendChild(chapterLink);
            });
        })
        .catch(error => console.error('Error fetching notes:', error));
}

function displayNotes(chapterIndex) {
    fetch('ChapterNotes.json')
        .then(response => response.json())
        .then(data => {
            const notesContainer = document.getElementById('notes-container');
            notesContainer.innerHTML = ''; // Clear previous content

            const chapter = data.Chapters[chapterIndex];
            const chapterDiv = document.createElement('div');
            chapterDiv.classList.add('chapter');

            const chapterTitle = document.createElement('h4');
            chapterTitle.textContent = chapter.ChapterTitle;
            chapterDiv.appendChild(chapterTitle);

            const sectionList = document.createElement('ul'); // Create a list for sections
            chapter.Sections.forEach(section => {
                const sectionItem = document.createElement('li'); // List item for section
                sectionItem.classList.add('section');
                sectionItem.textContent = section.SectionTitle;

                const subsectionList = document.createElement('ul'); // Create a list for subsections
                section.Subsections.forEach(subsection => {
                    const subsectionItem = document.createElement('li'); // List item for subsection
                    subsectionItem.classList.add('subsection');
                    subsectionItem.textContent = subsection.SubsectionTitle;

                    if (Array.isArray(subsection.Content)) {
                        const contentList = document.createElement('ul'); // Create a list for content
                        subsection.Content.forEach(content => {
                            const contentItem = document.createElement('li'); // List item for content
                            contentItem.classList.add('content');

                            const contentTitle = document.createElement('strong');
                            contentTitle.textContent = content.Title + ':';
                            contentItem.appendChild(contentTitle);

                            const contentDetails = document.createElement('p');
                            contentDetails.textContent = content.Details;
                            contentItem.appendChild(contentDetails);

                            contentList.appendChild(contentItem);
                        });
                        subsectionItem.appendChild(contentList);
                    } else {
                        const contentItem = document.createElement('li'); // List item for content
                        contentItem.classList.add('content');

                        const contentDetails = document.createElement('p');
                        contentDetails.textContent = subsection.Content;
                        contentItem.appendChild(contentDetails);

                        subsectionItem.appendChild(contentItem);
                    }

                    subsectionList.appendChild(subsectionItem);
                });

                sectionItem.appendChild(subsectionList);
                sectionList.appendChild(sectionItem);
            });

            chapterDiv.appendChild(sectionList);
            notesContainer.appendChild(chapterDiv);
        })
        .catch(error => console.error('Error fetching notes:', error));
}
