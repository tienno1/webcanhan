document.addEventListener('DOMContentLoaded', function() {
    const submitButton = document.getElementById('submit-answers');
    const resetButton = document.getElementById('reset-answers');
    const resultsDiv = document.getElementById('results');

    // Define correct answers for Exam 1
    const correctAnswers = {
        q1: 'C',
        q2: 'B',
        q3: 'C',
        q4: 'B',
        q5: 'C',
        q6: 'A',
        q7: 'C',
        q8: 'B',
        q9: 'A',
        q10: 'B',
        q11: 'A',
        q12: 'C',
        q13: 'B',
        q14: 'A',
        q15: 'B',
        q16: 'C',
        q17: 'A',
        q18: 'B',
        q19: 'B',
        q20: 'A',
        q21: 'C',
        q22: 'B',
        q23: 'A',
        q24: 'C',
        q25: 'what',
        q26: 'Do',
        q27: 'because',
        q28: 'to',
        q29: 'will'
    };

    // Function to reset the quiz to its initial state
    function resetQuiz() {
        // Uncheck all radio buttons
        document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
            radio.checked = false;
        });

        // Clear all text input fields and their styles
        document.querySelectorAll('input[type="text"]').forEach(input => {
            input.value = '';
            input.classList.remove('text-correct', 'text-incorrect');
            input.style.borderColor = ''; // Ensures direct style is also reset
        });

        // Remove correctness highlighting from question blocks and labels
        document.querySelectorAll('.question-block').forEach(block => {
            block.classList.remove('correct', 'incorrect');
        });

        document.querySelectorAll('.options label').forEach(label => {
            label.classList.remove('correct-answer', 'wrong-answer');
        });

        // Clear all error messages
        document.querySelectorAll('.error-message').forEach(msg => {
            msg.textContent = '';
        });

        // Hide the results div
        resultsDiv.innerHTML = '';
        resultsDiv.style.display = 'none';

        // Scroll to top of the page smoothly if desired
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    submitButton.addEventListener('click', function() {
        let score = 0;
        const totalQuestions = Object.keys(correctAnswers).length;
        const incorrectQuestions = [];

        // Reset all previous highlights and messages before re-checking
        document.querySelectorAll('.correct-answer, .wrong-answer, .text-correct, .text-incorrect').forEach(el => {
            el.classList.remove('correct-answer', 'wrong-answer', 'text-correct', 'text-incorrect');
        });
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
        document.querySelectorAll('.question-block').forEach(el => {
            el.classList.remove('correct', 'incorrect');
        });
        // Ensure direct border-color is also reset for text inputs
        document.querySelectorAll('.text-answer').forEach(input => {
            input.classList.remove('text-correct', 'text-incorrect');
            input.style.borderColor = '';
        });


        // Get user's answers and check them
        for (const qName in correctAnswers) {
            const questionBlock = document.querySelector(`.question-block[data-question="${qName}"]`);
            const correctAnswerValue = correctAnswers[qName];
            let selectedAnswerValue = null;

            // Only proceed if questionBlock exists, ensuring the HTML structure is correct
            if (!questionBlock) {
                console.warn(`Question block not found for ${qName}. Skipping.`);
                continue; // Skip this question if its block is not found
            }

            const textInput = questionBlock.querySelector(`input[name="${qName}"][type="text"]`);
            const errorMessageDiv = questionBlock.querySelector('.error-message'); // Error message is now always inside questionBlock

            if (textInput) {
                selectedAnswerValue = textInput.value.trim();

                // For text answers, check case-insensitively
                if (selectedAnswerValue.toLowerCase() === correctAnswerValue.toLowerCase()) {
                    score++;
                    questionBlock.classList.add('correct');
                    textInput.classList.add('text-correct');
                    textInput.style.borderColor = '#28a745'; // Apply direct style for immediate visual feedback
                } else {
                    questionBlock.classList.add('incorrect');
                    textInput.classList.add('text-incorrect');
                    textInput.style.borderColor = '#dc3545'; // Apply direct style for immediate visual feedback
                    if (errorMessageDiv) {
                        errorMessageDiv.textContent = `Câu trả lời sai. Đáp án đúng là: ${correctAnswerValue}`;
                    }
                    incorrectQuestions.push({
                        question: `Câu ${qName.replace('q', '')}`,
                        userAnswer: selectedAnswerValue || 'Chưa trả lời',
                        correctAnswer: correctAnswerValue
                    });
                }
            } else { // Handle radio button questions
                const selectedOption = questionBlock.querySelector(`input[name="${qName}"]:checked`);
                selectedAnswerValue = selectedOption ? selectedOption.value : null;

                // Always highlight the correct answer for radio buttons
                const correctOptionInput = questionBlock.querySelector(`input[value="${correctAnswerValue}"]`);
                if (correctOptionInput) {
                    correctOptionInput.parentElement.classList.add('correct-answer');
                }

                if (selectedAnswerValue === correctAnswerValue) {
                    score++;
                    questionBlock.classList.add('correct');
                } else {
                    questionBlock.classList.add('incorrect');
                    if (selectedAnswerValue) {
                        const selectedOptionLabel = questionBlock.querySelector(`input[value="${selectedAnswerValue}"]`).parentElement;
                        selectedOptionLabel.classList.add('wrong-answer');
                    }
                    if (errorMessageDiv) {
                        errorMessageDiv.textContent = `Câu trả lời sai. Đáp án đúng là: ${correctAnswerValue}`;
                    }

                    let questionNumber = qName.replace('q', '');
                    incorrectQuestions.push({
                        question: `Câu ${questionNumber}`,
                        userAnswer: selectedAnswerValue || 'Chưa trả lời',
                        correctAnswer: correctAnswerValue
                    });
                }
            }
        }

        const scoreOnTen = (score / totalQuestions) * 10;
        const incorrectCount = totalQuestions - score;

        let resultsHtml = `
            <h2>Kết quả của bạn</h2>
            <p>Số câu đúng: ${score} / ${totalQuestions}</p>
            <p>Số câu sai: ${incorrectCount} / ${totalQuestions}</p>
            <p>Điểm của bạn (thang điểm 10): ${scoreOnTen.toFixed(2)}</p>
        `;

        if (incorrectQuestions.length > 0) {
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

        resultsDiv.innerHTML = resultsHtml;
        resultsDiv.style.display = 'block';

        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    resetButton.addEventListener('click', resetQuiz);
});