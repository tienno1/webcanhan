document.addEventListener('DOMContentLoaded', function() {
    const submitButton = document.getElementById('submit-answers');
    const resetButton = document.getElementById('reset-answers');
    const resultsModal = document.getElementById('results-modal');
    const resultsContentDiv = document.getElementById('results-content');
    const closeButton = document.querySelector('.close-button');

    // Define correct answers for all parts
    const correctAnswers = {
        // READING PART 1 (Questions 1-6)
        // Short notices and messages
        q1: 'A', // Notice 1: "You can order this meal at any time." 
        q2: 'C', // Notice 2: "to help choose a gift for Tamara."
        q3: 'A', // Notice 3: "Customers are asked to get to the hairdressers 10 minutes early."
        q4: 'C', // Notice 4: "Ted's mum plans to prepare a light meal later."
        q5: 'A', // Notice 5: "Let the assistant know if you think there's a mistake on your receipt."
        q6: 'A', // Notice 6: "The shop will be open as usual from Tuesday."

        // READING PART 2 (Questions 7-13)
        // Three people talking about their holidays
        q7: 'C',  // Nikhil: Different foods in different places
        q8: 'A',  // Max: Long bus journey to hotel
        q9: 'C',  // Nikhil: Family activities
        q10: 'A', // Max: Cheap holiday
        q11: 'B', // Felipe: Friendly staff
        q12: 'A', // Max: Hot weather at night
        q13: 'C', // Felipe: Restaurant food quality

        // READING PART 3 (Questions 14-18)
        // Interview with a Go player
        q14: 'A', // When did he move: "five years ago"
        q15: 'C', // Where learned Go: "at school"
        q16: 'B', // Best thing about Go club: "making new friends"
        q17: 'C', // Film preferences: "comedies"
        q18: 'C', // Future plans: "keep playing Go"

        // READING PART 4 (Questions 19-24)
        // Gap fill text about travel
        q19: 'A', // good
        q20: 'B', // share
        q21: 'C', // place
        q22: 'B', // making
        q23: 'C', // especially
        q24: 'A', // save

        // WRITING PART 1 (Questions 25-29)
        // Email gap fill
        q25: 'is',     // My uncle ___ going to drive
        q26: 'in',     // beautiful ___ the autumn
        q27: 'a',      // rent ___ boat there
        q28: 'should', // you ___ probably bring
        q29: 'about',  // Don't worry ___ bringing

        // LISTENING PART 1 (Questions 1-5)
        // Pictures with multiple choice
        lq1: 'B', 
        lq2: 'B',
        lq3: 'C',
        lq4: 'B',
        lq5: 'A',

        // LISTENING PART 2 (Questions 6-10)
        // Conversations with multiple choice
        lq6: 'C',
        lq7: 'A',
        lq8: 'B',
        lq9: 'B',
        lq10: 'A',

        // LISTENING PART 3 (Questions 11-15)
        // Long conversation with multiple choice
        lq11: 'B',
        lq12: 'B',
        lq13: 'C',
        lq14: 'B',
        lq15: 'A',

        // LISTENING PART 4 (Questions 16-20)
        // Matching items to letters
        lq16: 'H', // H. cake
        lq17: 'B', // B. socks
        lq18: 'F', // F. towel
        lq19: 'G', // G. trainers
        lq20: 'C'  // C. flowers
    };

    // Store references to question blocks for easier access
    const questionBlocks = document.querySelectorAll('.question-block');

    submitButton.addEventListener('click', function() {
        const userAnswers = {};
        let score = 0;
        const incorrectQuestions = [];

        // Collect answers for READING PART 1 and PART 2 (radio buttons)
        document.querySelectorAll('.question-block[data-question^="q"]').forEach(block => {
            const questionId = block.dataset.question;
            const selectedOption = block.querySelector(`input[name="${questionId}"]:checked`);
            if (selectedOption) {
                userAnswers[questionId] = selectedOption.value;
            } else {
                userAnswers[questionId] = ''; // No answer selected
            }
        });

        // Collect answers for READING PART 3 (text inputs)
        document.querySelectorAll('.question-item[data-question^="lq"]').forEach(item => {
            const questionId = item.dataset.question;
            const textInput = item.querySelector('.text-answer');
            if (textInput) {
                userAnswers[questionId] = textInput.value.trim().toUpperCase(); // Convert to uppercase for case-insensitive comparison
            } else {
                userAnswers[questionId] = '';
            }
        });

        // Reset previous feedback
        document.querySelectorAll('.show-answer').forEach(span => {
            span.textContent = '';
            span.style.color = '';
        });
        document.querySelectorAll('.error-message').forEach(div => {
            div.textContent = '';
        });
        document.querySelectorAll('.question-block, .question-item').forEach(el => {
            el.classList.remove('correct', 'incorrect');
        });

        // Check answers and calculate score
        for (const questionId in correctAnswers) {
            const block = document.querySelector(`[data-question="${questionId}"]`);
            const showAnswerSpan = block ? block.querySelector('.show-answer') : null;
            const errorMessageDiv = block ? block.querySelector('.error-message') : null;

            if (userAnswers[questionId] === correctAnswers[questionId]) {
                score++;
                if (block) {
                    block.classList.add('correct');
                }
            } else {
                if (block) {
                    block.classList.add('incorrect');
                }
                const questionTextElement = block.querySelector('p'); // For reading parts 1&2
                const questionItemTextElement = block.querySelector('p'); // For matching part
                const questionText = questionTextElement ? questionTextElement.textContent.trim() : (questionItemTextElement ? questionItemTextElement.textContent.trim() : `Question ${questionId}`);

                incorrectQuestions.push({
                    question: questionText,
                    userAnswer: userAnswers[questionId] || 'Không trả lời',
                    correctAnswer: correctAnswers[questionId]
                });

                if (showAnswerSpan) {
                    showAnswerSpan.textContent = `Đáp án đúng: ${correctAnswers[questionId]}`;
                    showAnswerSpan.style.color = 'green';
                }
                if (errorMessageDiv) {
                    errorMessageDiv.textContent = `Sai. Đáp án đúng: ${correctAnswers[questionId]}`;
                    errorMessageDiv.style.color = 'red';
                }
            }
        }

        let resultsHtml = `<h2>Kết quả của bạn: ${score} / ${Object.keys(correctAnswers).length}</h2>`;

        if (incorrectQuestions.length > 0) {
            // Sort incorrect questions by their number before displaying
            incorrectQuestions.sort((a, b) => {
                const numA = parseInt(a.question.replace('Câu ', ''), 10);
                const numB = parseInt(b.question.replace('Câu ', ''), 10);
                return numA - numB;
            });

            resultsHtml += `
                <h3>Các câu trả lời sai:</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Câu hỏi</th>
                            <th>Đáp án của bạn</th>
                            <th>Đáp án đúng</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            incorrectQuestions.forEach(item => {
                resultsHtml += `
                    <tr>
                        <td>${item.question}</td>
                        <td>${item.userAnswer}</td>
                        <td>${item.correctAnswer}</td>
                    </tr>
                `;
            });
            resultsHtml += `
                    </tbody>
                </table>
            `;
        } else {
            resultsHtml += `<p>Chúc mừng! Bạn đã trả lời đúng tất cả các câu hỏi.</p>`;
        }

        resultsContentDiv.innerHTML = resultsHtml;
        resultsModal.style.display = 'flex'; // Display modal as flex

        // Scroll to top of the modal
        resultsModal.scrollTop = 0;
    });

    // Gắn sự kiện click cho nút đóng modal
    // Thêm console.log để kiểm tra sự tồn tại của closeButton
    console.log('closeButton element:', closeButton);
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            console.log('Close button clicked!'); // Log khi nút X được nhấn
            resultsModal.style.display = 'none';
        });
    } else {
        console.error('Error: Close button not found in the DOM.');
    }


    // Đóng modal khi click ra bên ngoài
    window.addEventListener('click', function(event) {
        if (event.target == resultsModal) {
            resultsModal.style.display = 'none';
        }
    });

    // Reset button functionality
    resetButton.addEventListener('click', resetQuiz);

    function resetQuiz() {
        // Reset radio buttons
        document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
            radio.checked = false;
        });

        // Reset text inputs
        document.querySelectorAll('.text-answer').forEach(input => {
            input.value = '';
        });

        // Clear feedback messages and classes
        document.querySelectorAll('.show-answer').forEach(span => {
            span.textContent = '';
            span.style.color = '';
        });
        document.querySelectorAll('.error-message').forEach(div => {
            div.textContent = '';
        });
        document.querySelectorAll('.question-block, .question-item').forEach(el => {
            el.classList.remove('correct', 'incorrect');
        });

        resultsContentDiv.innerHTML = ''; // Clear results content
        resultsModal.style.display = 'none'; // Hide modal
    }

    // Audio player functionality (as provided in your original script)
    const audioPlayers = document.querySelectorAll('audio');
    audioPlayers.forEach(player => {
        player.addEventListener('play', (event) => {
            // Pause other players when one starts playing
            audioPlayers.forEach(otherPlayer => {
                if (otherPlayer !== event.target) {
                    otherPlayer.pause();
                }
            });
        });
    });
});