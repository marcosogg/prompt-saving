document.addEventListener('DOMContentLoaded', function() {
    const promptInput = document.getElementById('promptInput');
    const saveButton = document.getElementById('savePrompt');
    const savedPromptsDiv = document.getElementById('savedPrompts');

    // Load saved prompts
    chrome.storage.sync.get(['prompts'], function(result) {
        const prompts = result.prompts || [];
        displayPrompts(prompts);
    });

    // Save new prompt
    saveButton.addEventListener('click', function() {
        savePrompt();
    });

    function savePrompt(index = -1) {
        const newPrompt = promptInput.value.trim();
        if (newPrompt) {
            chrome.storage.sync.get(['prompts'], function(result) {
                let prompts = result.prompts || [];
                if (index === -1) {
                    prompts.push(newPrompt);
                } else {
                    prompts[index] = newPrompt;
                }
                chrome.storage.sync.set({prompts: prompts}, function() {
                    displayPrompts(prompts);
                    promptInput.value = '';
                    saveButton.textContent = 'Save Prompt';
                    saveButton.onclick = function() { savePrompt(); };
                });
            });
        }
    }

    // Display saved prompts
    function displayPrompts(prompts) {
        savedPromptsDiv.innerHTML = '<h3>Saved Prompts:</h3>';
        prompts.forEach((prompt, index) => {
            const promptElement = document.createElement('div');
            promptElement.className = 'prompt-item';
            promptElement.innerHTML = `
                <span class="prompt-text">${prompt}</span>
                <div class="button-group">
                    <button class="copy-btn" data-index="${index}">C</button>
                    <button class="edit-btn" data-index="${index}">E</button>
                    <button class="delete-btn" data-index="${index}">D</button>
                </div>
            `;
            savedPromptsDiv.appendChild(promptElement);
        });

        // Add event listeners to buttons
        document.querySelectorAll('.copy-btn').forEach(button => {
            button.addEventListener('click', function() {
                copyToClipboard(prompts[this.getAttribute('data-index')]);
            });
        });

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                promptInput.value = prompts[index];
                saveButton.textContent = 'Update Prompt';
                saveButton.onclick = function() { savePrompt(index); };
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                if (confirm('Are you sure you want to delete this prompt?')) {
                    prompts.splice(index, 1);
                    chrome.storage.sync.set({prompts: prompts}, function() {
                        displayPrompts(prompts);
                    });
                }
            });
        });
    }

    // Copy to clipboard function
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(function() {
            // Success: No alert, silent copy
        }, function(err) {
            console.error('Could not copy text: ', err);
        });
    }
});
