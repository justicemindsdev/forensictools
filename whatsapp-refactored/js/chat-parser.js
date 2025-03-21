/**
 * Chat Parser Module
 * 
 * Handles the parsing and processing of WhatsApp chat data.
 * Includes functions for reading files, extracting message information,
 * and identifying special message types.
 */

// Immediately Invoked Function Expression (IIFE) to avoid global namespace pollution
(function() {
    'use strict';

    // Stopwords for filtering common words in analysis
    const stopwords = new Set([
        "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at", 
        "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can't", "cannot", "could", 
        "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for", 
        "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", 
        "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", 
        "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", 
        "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", 
        "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", 
        "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", 
        "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too", 
        "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", 
        "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", 
        "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", 
        "yourselves", "just", "like", "get", "got", "also", "much", "many", "even", "now", "one", "two", "will", "shall"
    ]);

    // Chat Parser Module
    const ChatParser = {
        // Global variables for analysis results
        loveExpressionsCount: 0,
        questionsCount: 0,
        questionResponseRate: 0,
        
        // Initialize the chat parser
        init: function() {
            // Event handlers can be initialized here if needed
        },
        
        // Process chat data from uploaded file
        processChatData: async function() {
            const file = UIController.elements.fileInput.files[0];
            if (!file) return;

            // Reset data
            AppState.resetData();
            
            // Show loading
            UIController.showLoading('Processing digital evidence...');
            
            try {
                let chatText = '';
                
                // Process file based on type
                if (file.name.endsWith('.zip')) {
                    UIController.showLoading('EXTRACTING ARCHIVE...');
                    const zip = new JSZip();
                    const zipContents = await zip.loadAsync(file);
                    
                    // Find the _chat.txt file in the zip
                    let chatFile = null;
                    zipContents.forEach((relativePath, zipEntry) => {
                        if (relativePath.endsWith('_chat.txt')) {
                            chatFile = zipEntry;
                        }
                    });
                    
                    if (chatFile) {
                        UIController.showLoading('READING EVIDENCE FILE...');
                        chatText = await chatFile.async('text');
                    } else {
                        throw new Error('No _chat.txt file found in the archive');
                    }
                } else if (file.name.endsWith('.txt')) {
                    UIController.showLoading('READING EVIDENCE FILE...');
                    chatText = await file.text();
                } else {
                    throw new Error('Unsupported file format. Please upload a .txt or .zip file.');
                }
                
                UIController.showLoading('PARSING DIGITAL EVIDENCE...');
                await this.parseChatData(chatText);
                
                UIController.showLoading('ANALYZING CONVERSATION PATTERNS...');
                await this.analyzeChat();
                
                // Display results
                UIController.displayMessages();
                Statistics.displayStats();
                
                // Hide loading and show results
                UIController.hideLoading();
                
            } catch (error) {
                UIController.hideLoading();
                alert('Error processing evidence: ' + error.message);
                console.error(error);
            }
        },
        
        // Parse WhatsApp chat data
        parseChatData: async function(chatText) {
            // Define a regex pattern to match WhatsApp messages
            // Format: [date, time] sender: message
            const messageRegex = /\[(\d{1,2}\/\d{1,2}\/\d{4}),\s(\d{1,2}:\d{2}(?::\d{2})?(?:\s[AP]M)?)\]\s([^:]+):\s([\s\S]*?)(?=\[\d{1,2}\/\d{1,2}\/\d{4}|$)/g;
            
            let match;
            let id = 0;
            
            while ((match = messageRegex.exec(chatText)) !== null) {
                const [, date, time, sender, message] = match;
                
                // Normalize sender name
                const normalizedSender = sender.trim();
                
                // Track participants
                if (!AppState.participants.has(normalizedSender)) {
                    AppState.participants.set(normalizedSender, {
                        name: normalizedSender,
                        messageCount: 0,
                        wordCount: 0
                    });
                }
                
                const participant = AppState.participants.get(normalizedSender);
                participant.messageCount++;
                
                // Count words in the message
                const words = message.split(/\s+/).filter(word => word.length > 0);
                participant.wordCount += words.length;
                
                // Determine if the message contains media
                const isMedia = message.includes('<Media omitted>') || 
                                message.includes('<image omitted>') || 
                                message.includes('<video omitted>') || 
                                message.includes('<audio omitted>');
                
                // Parse date in DD/MM/YYYY format
                const dateParts = date.split('/');
                const dateObj = new Date(
                    parseInt(dateParts[2]), // Year
                    parseInt(dateParts[1]) - 1, // Month (0-based)
                    parseInt(dateParts[0]) // Day
                );
                
                // Add time
                const timeParts = time.split(':');
                let hours = parseInt(timeParts[0]);
                const minutes = parseInt(timeParts[1]);
                const seconds = timeParts.length > 2 ? parseInt(timeParts[2]) : 0;
                
                // Handle AM/PM format if present
                if (time.includes('PM') && hours < 12) {
                    hours += 12;
                } else if (time.includes('AM') && hours === 12) {
                    hours = 0;
                }
                
                dateObj.setHours(hours, minutes, seconds);
                
                // Format the timestamp in YYYY-MM-DD HH:MM:SS format
                const formattedTimestamp = `${dateObj.getFullYear()}-${(dateObj.getMonth()+1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')} ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}:${dateObj.getSeconds().toString().padStart(2, '0')}`;
                
                // Add message to the array
                AppState.chatMessages.push({
                    id: `JM-E${(2200 + id++).toString().padStart(4, '0')}`,
                    sender: normalizedSender,
                    message: message.trim(),
                    timestamp: dateObj,
                    formattedTimestamp,
                    isMedia,
                    isQuestion: this.isQuestionMessage(message)
                });
            }
            
            // Sort messages by timestamp
            AppState.chatMessages.sort((a, b) => a.timestamp - b.timestamp);
            
            // Set filtered messages to all messages initially
            AppState.filteredMessages = [...AppState.chatMessages];
        },
        
        // Analyze chat data for patterns and statistics
        analyzeChat: async function() {
            // Analyze word frequency
            const words = AppState.chatMessages
                .map(msg => msg.message.toLowerCase())
                .join(' ')
                .split(/\s+/)
                .filter(word => 
                    word.length > 2 && 
                    !stopwords.has(word.toLowerCase()) &&
                    !/^\d+$/.test(word) && // Exclude numbers
                    !/^[^\w\s]$/.test(word) // Exclude single punctuation
                );
            
            // Count word frequency
            words.forEach(word => {
                // Remove punctuation from the word
                const cleanWord = word.replace(/[^\w\s]/g, '');
                if (cleanWord.length > 2) {
                    AppState.wordFrequency[cleanWord] = (AppState.wordFrequency[cleanWord] || 0) + 1;
                }
            });
            
            // Find love expressions
            const loveExpressions = AppState.chatMessages.filter(msg => 
                msg.message.toLowerCase().includes('i love you') ||
                msg.message.toLowerCase().includes('love you') ||
                msg.message.toLowerCase().includes('love u') ||
                msg.message.toLowerCase().includes('❤️') ||
                msg.message.toLowerCase().includes('<3')
            );
            
            // Find questions and responses
            const questions = AppState.chatMessages.filter(msg => msg.isQuestion);
            
            // Analyze response rate
            let responsesCount = 0;
            
            for (let i = 0; i < questions.length; i++) {
                const question = questions[i];
                // Check if there's a message from another person within 3 messages after the question
                for (let j = AppState.chatMessages.indexOf(question) + 1; 
                     j < AppState.chatMessages.indexOf(question) + 4 && j < AppState.chatMessages.length; 
                     j++) {
                    if (AppState.chatMessages[j].sender !== question.sender) {
                        responsesCount++;
                        break;
                    }
                }
            }
            
            // Update analysis results
            this.loveExpressionsCount = loveExpressions.length;
            this.questionsCount = questions.length;
            this.questionResponseRate = questions.length > 0 ? (responsesCount / questions.length) * 100 : 0;
        },
        
        // Check if message is a question
        isQuestionMessage: function(message) {
            // Remove URLs
            const messageWithoutUrls = message.replace(/https?:\/\/\S+/g, '');
            
            // Check for question marks
            if (messageWithoutUrls.includes('?')) {
                return true;
            }
            
            // Check for question words at start of sentences
            const questionStarters = [
                'who', 'what', 'when', 'where', 'why', 'how', 'is', 'are', 'was',
                'were', 'will', 'would', 'could', 'should', 'do', 'does', 'did',
                'have', 'has', 'had', 'can'
            ];
            
            const sentences = messageWithoutUrls.split(/[.!?]+/).filter(s => s.trim().length > 0);
            
            for (const sentence of sentences) {
                const firstWord = sentence.trim().split(/\s+/)[0].toLowerCase();
                if (questionStarters.includes(firstWord)) {
                    return true;
                }
            }
            
            return false;
        }
    };

    // Make ChatParser globally accessible
    window.ChatParser = ChatParser;
})();
