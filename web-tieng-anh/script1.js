document.addEventListener('DOMContentLoaded', function() {
    const submitButton = document.getElementById('submit-answers');
    const resetButton = document.getElementById('reset-answers');
    const resultsDiv = document.getElementById('results');

    // Define correct answers for Exam 1 - CORRECTED ANSWERS
    const correctAnswers = {
        q1: 'B', // Corrected based on "You can order this meal at any time." for "all day"
        q2: 'C', // "to help choose a gift for Tamara." based on "You always know what she likes."
        q3: 'A', // "Customers are asked to get to the hairdressers 10 minutes early." based on "Please arrive 10 minutes before your appointment time"
        q4: 'C', // "Ted's mum plans to prepare a light meal later." based on "will make us all a snack when we get back at 8 p.m."
        q5: 'A', // "Let the assistant know if you think there's a mistake on your receipt." based on "tell the assistant if there is a problem."
        q6: 'A', // "The shop will be open as usual from Tuesday." based on "Open again normal times (9 a.m.-6 p.m.) tomorrow (Tuesday)."
        q7: 'C', // Nikhil: "I couldn't believe the differences in what people ate from place to place."
        q8: 'A', // Max: "it took two hours by bus to get to the hotel - I didn't enjoy that!"
        q9: 'C', // Nikhil: "It was good to be with the family, because there was always someone to talk to, or to do things with"
        q10: 'A',// Max: "the best thing was, we spent almost nothing once we arrived!"
        q11: 'B',// Felipe: "The people who worked there were wonderful"
        q12: 'A',// Max: "It was hard to sleep with such high temperatures"
        q13: 'B',// Felipe: "I wasn't so sure about the hotel restaurant the desserts were fine, but the main courses weren't very good."
        q14: 'A', // five years: "His parents moved there with the whole family five years ago."
        q15: 'C', // at school: "Luckily the PE teacher is fantastic player she taught us at lunch time."
        q16: 'B', // making new friends: "The best thing is meeting lots of lovely people. We have loads of fun together."
        q17: 'A', // comedies: "I prefer the funny stuff. If it doesn't make me laugh, I'm not interested"
        q18: 'C', // He wants to keep playing Go.: "The one thing he knows for sure is that he'll never stop enjoying the game."
        q19: 'A', // good: "but not good for the world around us." (common collocation)
        q20: 'B', // share: "One possibility is to share car journeys." (common collocation for carpooling)
        q21: 'C', // place: "who need to travel to the same place as you" (referring to destination)
        q22: 'B', // making: "two or three cars making the same journey" (common collocation)
        q23: 'C', // especially: "especially in a town or city." (indicates a particular emphasis)
        q24: 'A', // save: "You'll get fit and save money too!" (common collocation)
        q25: 'is',  // Corrected for "My uncle is going to drive"
        q26: 'should', // Corrected for "You should probably bring"
        q27: 'in',   // Corrected for "The forest is beautiful in the autumn"
        q28: 'a',    // Corrected for "we're going to visit a book there" (assuming a bookshop or similar)
        q29: 'about' // Corrected for "Don't worry about bringing food"
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

        // Clear all error messages and correct answer displays for text inputs
        document.querySelectorAll('.error-message').forEach(msg => {
            msg.textContent = '';
        });
        document.querySelectorAll('.show-answer').forEach(span => {
            span.remove(); // Remove dynamically added correct answer spans
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
        document.querySelectorAll('.text-answer').forEach(input => {
            input.classList.remove('text-correct', 'text-incorrect');
            input.style.borderColor = '';
        });
        // Remove existing correct answer hints for text inputs
        document.querySelectorAll('.show-answer').forEach(span => {
            span.remove();
        });


        // Get user's answers and check them
        for (const qName in correctAnswers) {
            const questionBlock = document.querySelector(`.question-block[data-question="${qName}"]`);
            const correctAnswerValue = correctAnswers[qName];
            let selectedAnswerValue = null;

            // Check if it's a text input question
            const textInput = document.querySelector(`input[name="${qName}"][type="text"]`); // Directly select text input

            if (textInput) {
                selectedAnswerValue = textInput.value.trim();

                if (selectedAnswerValue.toLowerCase() === correctAnswerValue.toLowerCase()) {
                    score++;
                    if (questionBlock) questionBlock.classList.add('correct');
                    textInput.classList.add('text-correct');
                    textInput.style.borderColor = '#28a745';
                } else {
                    if (questionBlock) questionBlock.classList.add('incorrect');
                    textInput.classList.add('text-incorrect');
                    textInput.style.borderColor = '#dc3545';

                    // Display correct answer next to the text input
                    const answerSpan = document.createElement('span');
                    answerSpan.classList.add('show-answer');
                    answerSpan.textContent = ` (Đáp án đúng: ${correctAnswerValue})`;
                    // Ensure the span is added only once
                    if (!textInput.nextElementSibling || !textInput.nextElementSibling.classList.contains('show-answer')) {
                        textInput.parentNode.insertBefore(answerSpan, textInput.nextSibling);
                    }


                    incorrectQuestions.push({
                        question: `Câu ${qName.replace('q', '')}`,
                        userAnswer: selectedAnswerValue || 'Chưa trả lời',
                        correctAnswer: correctAnswerValue
                    });
                }
            } else { // It's a radio button question
                const selectedOption = questionBlock ? questionBlock.querySelector(`input[name="${qName}"]:checked`) : null;
                selectedAnswerValue = selectedOption ? selectedOption.value : null;

                if (questionBlock) {
                    const correctOptionLabel = questionBlock.querySelector(`input[value="${correctAnswerValue}"]`).parentElement;


                    if (selectedAnswerValue === correctAnswerValue) {
                        score++;
                        questionBlock.classList.add('correct');
                        correctOptionLabel.classList.add('correct-answer');
                    } else {
                        questionBlock.classList.add('incorrect');
                        if (selectedAnswerValue) {
                            const selectedOptionLabel = questionBlock.querySelector(`input[value="${selectedAnswerValue}"]`).parentElement;
                            selectedOptionLabel.classList.add('wrong-answer');
                        }
                         correctOptionLabel.classList.add('correct-answer');
                        const errorMessageDiv = questionBlock.querySelector('.error-message');
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

// The checkTextAnswer function is now integrated directly into the submit logic
// function checkTextAnswer(input, correctAnswer) {
//     // This function is no longer needed as its logic is in the main submit handler
// }