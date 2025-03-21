/**
 * Statistics Module
 * 
 * Handles statistical analysis and visualization of chat data.
 * Manages word frequency charts, message statistics, and participant information.
 */

// Immediately Invoked Function Expression (IIFE) to avoid global namespace pollution
(function() {
    'use strict';

    // Statistics Module
    const Statistics = {
        // Initialize statistics module
        init: function() {
            // No initialization needed for now
        },
        
        // Display statistics in the UI
        displayStats: function() {
            // Basic stats
            const totalMessages = AppState.chatMessages.length;
            const messageWords = AppState.chatMessages.map(msg => msg.message.split(/\s+/).filter(w => w.length > 0).length);
            const totalWords = messageWords.reduce((sum, count) => sum + count, 0);
            
            // Calculate date range in days
            const firstDate = AppState.chatMessages.length > 0 ? AppState.chatMessages[0].timestamp : new Date();
            const lastDate = AppState.chatMessages.length > 0 ? AppState.chatMessages[AppState.chatMessages.length - 1].timestamp : new Date();
            const daysDiff = Math.floor((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;
            
            // Count media messages
            const mediaCount = AppState.chatMessages.filter(msg => msg.isMedia).length;
            
            // Update stats UI
            UIController.elements.totalMessagesEl.textContent = totalMessages.toLocaleString();
            UIController.elements.totalWordsEl.textContent = totalWords.toLocaleString();
            UIController.elements.activeDaysEl.textContent = `${daysDiff} days`;
            UIController.elements.mediaCountEl.textContent = mediaCount.toLocaleString();
            
            // Sort participants by message count
            const sortedParticipants = [...AppState.participants.values()]
                .sort((a, b) => b.messageCount - a.messageCount);
            
            // Generate participants list
            UIController.elements.participantsListEl.innerHTML = '';
            sortedParticipants.forEach(participant => {
                const participantEl = document.createElement('div');
                participantEl.className = 'flex justify-between items-center bg-justice p-2 rounded';
                participantEl.innerHTML = `
                    <div class="font-medium">${participant.name}</div>
                    <div class="text-gray-400">${participant.messageCount.toLocaleString()} msgs</div>
                `;
                UIController.elements.participantsListEl.appendChild(participantEl);
            });
            
            // Update special message stats
            UIController.elements.loveCountEl.textContent = `${ChatParser.loveExpressionsCount} instances found`;
            UIController.elements.questionCountEl.textContent = `${ChatParser.questionsCount} questions found`;
            UIController.elements.responseRateEl.textContent = `${ChatParser.questionResponseRate.toFixed(1)}% of questions received responses`;
            
            // Add participant click handlers 
            this.addParticipantClickHandlers();
            
            // Create word frequency chart
            this.createWordFrequencyChart();
        },
        
        // Add click handlers to participant list items
        addParticipantClickHandlers: function() {
            document.querySelectorAll('#participants-list > div').forEach(div => {
                div.style.cursor = 'pointer';
                div.title = 'Click to filter messages from this subject';
                div.classList.add('hover:bg-justice-accent');
                
                // Get subject name from the div
                const name = div.querySelector('.font-medium').textContent;
                
                // Add click handler
                div.addEventListener('click', function() {
                    UIController.filterBySubject(name);
                });
            });
        },
        
        // Create word frequency chart
        createWordFrequencyChart: function() {
            // Get the top words
            const sortedWords = Object.entries(AppState.wordFrequency)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);
            
            const labels = sortedWords.map(([word]) => word);
            const data = sortedWords.map(([, count]) => count);
            
            // Clear previous chart if exists
            if (AppState.wordChart) {
                AppState.wordChart.destroy();
            }
            
            // Get chart context
            const ctx = document.getElementById('word-freq-chart').getContext('2d');
            
            // Create chart
            AppState.wordChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Frequency',
                        data: data,
                        backgroundColor: '#1a508b',
                        borderColor: '#0d2d4e',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: '#d1d5db'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#d1d5db'
                            },
                            grid: {
                                display: false
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    };

    // Make Statistics globally accessible
    window.Statistics = Statistics;
})();
