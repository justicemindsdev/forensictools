/**
 * Main Application Controller
 * 
 * This script serves as the main entry point for the Justice Minds Forensics application.
 * It initializes all modules and coordinates their interactions.
 */

// Immediately Invoked Function Expression (IIFE) to avoid global namespace pollution
(function() {
    'use strict';

    // Application state
    const AppState = {
        // Global variables (formerly declared in the global scope)
        chatMessages: [],
        participants: new Map(),
        wordFrequency: {},
        currentPage: 1,
        messagesPerPage: 50,
        filteredMessages: [],
        wordChart: null,
        selectedMessages: new Set(),
        
        // Initialize the application
        init: function() {
            // Initialize all modules
            UIController.init();
            ChatParser.init();
            Statistics.init();
            Evidence.init();
            AIAnalysis.init();
            
            // Set up real-time clock
            this.initTimestamp();
            
            // Generate random case ID
            document.getElementById('case-id').textContent = Math.floor(10000000 + Math.random() * 90000000).toString();
        },
        
        // Initialize and update timestamp display
        initTimestamp: function() {
            function updateTimestamp() {
                const now = new Date();
                const formatted = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
                document.getElementById('timestamp-display').textContent = formatted;
            }
            
            // Update timestamp initially and every second
            updateTimestamp();
            setInterval(updateTimestamp, 1000);
        },
        
        // Reset all application data
        resetData: function() {
            this.chatMessages = [];
            this.participants = new Map();
            this.wordFrequency = {};
            this.currentPage = 1;
            this.selectedMessages.clear();
            this.filteredMessages = [];
            
            if (this.wordChart) {
                this.wordChart.destroy();
                this.wordChart = null;
            }
        }
    };

    // Initialize the application when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        AppState.init();
    });

    // Make AppState globally accessible (for module communication)
    window.AppState = AppState;
})();
