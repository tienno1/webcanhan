document.addEventListener('DOMContentLoaded', function() {
    const submitButton = document.getElementById('submit-answers');
    const resetButton = document.getElementById('reset-answers'); // Get the new reset button
    const resultsDiv = document.getElementById('results');

    // Define correct answers for all questions
    const correctAnswers = {
        // READING PART 1 (Questions 1-6)
        q1: 'C', // Leave shoes...
        q2: 'B', // GUEST notice
        q3: 'A', // The sports centre...
        q4: 'A', // Please use stairs...
        q5: 'C', // Visitor Notice
        q6: 'A', // Door on this floor...

        // READING PART 2 (Questions 7-13)
        q7: 'C', // Who became interested in nature from seeing someone else's blog?
        q8: 'B', // Who says there is something about her job that she doesn't like?
        q9: 'A', // Whose friends thought that her hobby was unusual?
        q10: 'B', // Who became interested in nature because of school trips?
        q11: 'A', // Who says that the type of nature she is interested in has changed?
        q12: 'C', // Who wants to improve her pictures of nature?
        q13: 'B', // Who thinks that young people should learn more about nature at school?

        // READING PART 3 (Questions 14-18)
        q14: 'A', // Where did Sandy lose her camera?
        q15: 'B', // What did Sandy do?
        q16: 'C', // What was the first job she got?
        q17: 'A', // What else did she do to make more money?
        q18: 'B', // The camera she bought was

        // READING PART 4 (Questions 19-24)
        q19: 'B', // travel... to (stay) in this hotel
        q20: 'A', // you have to (climb) up
        q21: 'A', // It's also the (highest)
        q22: 'B', // It even has a (shower)
        q23: 'A', // Another room is (called) the 'Mirrorcube'
        q24: 'C',   // good place to (go) fishing

        // WRITING PART 1 (Questions 25-29, Fill-in-the-blanks)
        q25: 'What', // 25. And (What) Is your university course like?
        q26: 'Do',   // 26. (Do) you think you might come back for a visit soon?
        q27: 'because', // 27. (because) I didn’t know anyone,
        q28: 'to',   // 28. starting (to) enjoy myself.
        q29: 'will'  // 29. I’m sure that I (will) come home
    };

    // Function to reset the quiz to its initial state
    function resetQuiz() {
        // Uncheck all radio buttons
        document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
            radio.checked = false;
        });

        // Clear all text input fields
        document.querySelectorAll('input[type="text"]').forEach(input => {
            input.value = '';
            input.classList.remove('text-correct', 'text-incorrect');
            input.style.borderColor = ''; // Reset border color for text inputs
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
        const userAnswers = {};
        const incorrectQuestions = []; // Array to store incorrect questions

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
        document.querySelectorAll('.text-answer').forEach(input => {
            input.classList.remove('text-correct', 'text-incorrect');
            input.style.borderColor = ''; // Reset border color for text inputs
        });


        // Get user's answers and check them
        for (const qName in correctAnswers) {
            const questionBlock = document.querySelector(`.question-block[data-question="${qName}"]`);
            const correctAnswerValue = correctAnswers[qName];
            let selectedAnswerValue = null;

            // Check if it's a text input question (WRITING PART 1)
            const textInput = document.querySelector(`input[name="${qName}"][type="text"]`);

            if (textInput) { // Handle WRITING PART 1 (text inputs)
                selectedAnswerValue = textInput.value.trim(); // Get user's input, trim whitespace
                userAnswers[qName] = selectedAnswerValue;

                const errorMessageDiv = questionBlock ? questionBlock.querySelector('.error-message') : null;

                // Case-insensitive comparison for text answers
                if (selectedAnswerValue.toLowerCase() === correctAnswerValue.toLowerCase()) {
                    score++;
                    if (questionBlock) questionBlock.classList.add('correct');
                    textInput.classList.add('text-correct');
                    textInput.style.borderColor = '#28a745'; // Green border
                } else {
                    if (questionBlock) questionBlock.classList.add('incorrect');
                    textInput.classList.add('text-incorrect');
                    textInput.style.borderColor = '#dc3545'; // Red border
                    if (errorMessageDiv) {
                        errorMessageDiv.textContent = `Câu trả lời sai. Đáp án đúng là: ${correctAnswerValue}`;
                    }
                    incorrectQuestions.push({
                        question: `Câu ${qName.replace('q', '')}`, // Format as "Câu 25", "Câu 26", etc.
                        userAnswer: selectedAnswerValue || 'Chưa trả lời',
                        correctAnswer: correctAnswerValue
                    });
                }
            } else { // Handle multiple choice questions
                const selectedOption = document.querySelector(`input[name="${qName}"]:checked`);
                selectedAnswerValue = selectedOption ? selectedOption.value : null;
                userAnswers[qName] = selectedAnswerValue;

                if (questionBlock) {
                    // Always highlight the correct answer for multiple choice
                    const correctOptionLabel = questionBlock.querySelector(`input[value="${correctAnswerValue}"]`).parentElement;
                    correctOptionLabel.classList.add('correct-answer');

                    if (selectedAnswerValue === correctAnswerValue) {
                        score++;
                        questionBlock.classList.add('correct');
                    } else {
                        questionBlock.classList.add('incorrect');
                        if (selectedAnswerValue) {
                            const selectedOptionLabel = questionBlock.querySelector(`input[value="${selectedAnswerValue}"]`).parentElement;
                            selectedOptionLabel.classList.add('wrong-answer');
                        }
                        const errorMessageDiv = questionBlock.querySelector('.error-message');
                        if (errorMessageDiv) {
                            errorMessageDiv.textContent = `Câu trả lời sai. Đáp án đúng là: ${correctAnswerValue}`;
                        }

                        let questionNumber = qName.replace('q', '');
                        incorrectQuestions.push({
                            question: `Câu ${questionNumber}`, // Format as "Câu 1", "Câu 2", etc.
                            userAnswer: selectedAnswerValue || 'Chưa trả lời',
                            correctAnswer: correctAnswerValue
                        });
                    }
                }
            }
        }

        // Calculate score on a scale of 10
        const scoreOnTen = (score / totalQuestions) * 10;
        const incorrectCount = totalQuestions - score;

        // Display detailed results in a summary table
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

        // Scroll to the results section smoothly
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Add event listener for the reset button
    resetButton.addEventListener('click', resetQuiz);
});