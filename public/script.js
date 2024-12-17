document.addEventListener('DOMContentLoaded', () => {
    const textArea = document.getElementById("text_to_summarize");
    const submitButton = document.getElementById("submit-button");
    const summarizedTextArea = document.getElementById("summary");
    const charCountDisplay = document.getElementById("char-count");

    // Disable submit button initially
    submitButton.disabled = true;

    // Character count and validation
    textArea.addEventListener("input", function(e) {
        const currentLength = this.value.length;
        charCountDisplay.textContent = `${currentLength} / 100,000 characters`;

        // Enable/disable button based on text length
        if (currentLength >= 200 && currentLength <= 100000) {
            submitButton.disabled = false;
            charCountDisplay.classList.remove('text-red-500');
        } else {
            submitButton.disabled = true;
            charCountDisplay.classList.add('text-red-500');
        }
    });

    // Submission handler
    submitButton.addEventListener("click", async function(e) {
        // Disable button and show loading state
        submitButton.disabled = true;
        submitButton.classList.add('opacity-50', 'cursor-not-allowed');
        submitButton.innerHTML = `
            <div class="flex items-center justify-center">
                <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
            </div>
        `;

        const text_to_summarize = textArea.value.trim();

        try {
            const response = await fetch('/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text_to_summarize })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Summarization failed');
            }

            // Update summary textarea
            summarizedTextArea.value = data.summary;

            // Success notification
            const originalButtonText = 'Summarize';
            submitButton.innerHTML = originalButtonText;
        } catch (error) {
            // Error handling
            console.error('Summarization error:', error);
            summarizedTextArea.value = `Error: ${error.message}`;
            
            // Show error notification
            submitButton.innerHTML = 'Try Again';
            submitButton.classList.add('bg-red-500', 'hover:bg-red-600');
        } finally {
            // Re-enable button
            submitButton.disabled = false;
            submitButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    });
});