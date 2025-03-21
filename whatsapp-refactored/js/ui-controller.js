/**
 * UI Controller Module
 * 
 * Handles all UI interactions and display operations.
 * Manages tab navigation, message display, pagination, and filtering.
 */

// Immediately Invoked Function Expression (IIFE) to avoid global namespace pollution
(function() {
    'use strict';

    // UI Controller module
    const UIController = {
        // DOM elements cache
        elements: {},
        
        // Initialize UI controller
        init: function() {
            this.cacheElements();
            this.setupEventListeners();
        },
        
        // Cache DOM elements for better performance
        cacheElements: function() {
            // Inputs
            this.elements.fileInput = document.getElementById('file-input');
            this.elements.messageSearch = document.getElementById('message-search');
            this.elements.messageFilter = document.getElementById('message-filter');
            this.elements.showMediaInline = document.getElementById('show-media-inline');
            this.elements.mediaInput = document.getElementById('media-input');
            this.elements.timelineMediaInput = document.getElementById('timeline-media-input');
            this.elements.evidenceQuery = document.getElementById('evidence-query');
            
            // Buttons
            this.elements.analyzeBtn = document.getElementById('analyze-btn');
            this.elements.prevPageBtn = document.getElementById('prev-page');
            this.elements.nextPageBtn = document.getElementById('next-page');
            this.elements.resetFilterBtn = document.getElementById('reset-filter');
            this.elements.queryBtn = document.getElementById('query-btn');
            this.elements.runAnalysisBtn = document.getElementById('run-analysis-btn');
            this.elements.addClaimBtn = document.getElementById('add-claim-btn');
            this.elements.uploadMediaBtn = document.getElementById('upload-media-btn');
            
            // Navigation and tabs
            this.elements.navTabs = document.querySelectorAll('.nav-tab');
            this.elements.tabContents = document.querySelectorAll('.tab-content');
            
            // Display containers
            this.elements.loadingEl = document.getElementById('loading');
            this.elements.loadingTextEl = document.getElementById('loading-text');
            this.elements.resultsContainer = document.getElementById('results-container');
            this.elements.messagesContainer = document.getElementById('messages-container');
            this.elements.pageInfoEl = document.getElementById('page-info');
            this.elements.messageCountEl = document.getElementById('message-count');
            this.elements.uploadInfoEl = document.getElementById('upload-info');
            this.elements.selectedMessagesContainer = document.getElementById('selected-messages-container');
            this.elements.queryResult = document.getElementById('query-result');
            this.elements.aiResponse = document.getElementById('ai-response');
            this.elements.analysisLoading = document.getElementById('analysis-loading');
            this.elements.analysisResults = document.getElementById('analysis-results');
            
            // Stats elements
            this.elements.totalMessagesEl = document.getElementById('total-messages');
            this.elements.totalWordsEl = document.getElementById('total-words');
            this.elements.activeDaysEl = document.getElementById('active-days');
            this.elements.mediaCountEl = document.getElementById('media-count');
            this.elements.participantsListEl = document.getElementById('participants-list');
            this.elements.loveCountEl = document.getElementById('love-count');
            this.elements.questionCountEl = document.getElementById('question-count');
            this.elements.responseRateEl = document.getElementById('response-rate');
        },
        
        // Set up event listeners
        setupEventListeners: function() {
            // Tab navigation
            this.elements.navTabs.forEach(tab => {
                tab.addEventListener('click', () => this.switchTab(tab));
            });
            
            // File input and analysis
            this.elements.fileInput.addEventListener('change', this.handleFileInputChange.bind(this));
            this.elements.analyzeBtn.addEventListener('click', () => ChatParser.processChatData());
            
            // Message filtering
            this.elements.messageSearch.addEventListener('input', this.filterAndDisplayMessages.bind(this));
            this.elements.messageFilter.addEventListener('change', this.filterAndDisplayMessages.bind(this));
            this.elements.resetFilterBtn.addEventListener('click', this.resetAllFilters.bind(this));
            
            // Pagination
            this.elements.prevPageBtn.addEventListener('click', () => {
                if (AppState.currentPage > 1) {
                    AppState.currentPage--;
                    this.displayMessages();
                }
            });
            
            this.elements.nextPageBtn.addEventListener('click', () => {
                if (AppState.currentPage < Math.ceil(AppState.filteredMessages.length / AppState.messagesPerPage)) {
                    AppState.currentPage++;
                    this.displayMessages();
                }
            });
            
            // AI and evidence features
            this.elements.queryBtn.addEventListener('click', () => Evidence.queryEvidence());
            this.elements.runAnalysisBtn.addEventListener('click', () => AIAnalysis.runAnalysis());
            this.elements.addClaimBtn.addEventListener('click', () => Evidence.addNewClaim());
            this.elements.uploadMediaBtn.addEventListener('click', () => Evidence.uploadMedia());
            
            // Handle timeline media uploads
            this.elements.timelineMediaInput.addEventListener('change', function(e) {
                const files = e.target.files;
                if (!files || files.length === 0) return;
                
                // Process each file
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) continue;
                    
                    const mediaId = `JM-TM${(i + 1).toString().padStart(3, '0')}`;
                    
                    // For demo purposes, use predefined timestamps
                    const demoTimestamps = [
                        "2020-10-19 18:15:22",
                        "2020-10-19 18:17:45",
                        "2020-10-19 19:05:12"
                    ];
                    const timestamp = demoTimestamps[i % demoTimestamps.length];
                    
                    // Create media URL
                    const url = URL.createObjectURL(file);
                    
                    // Add directly to timeline
                    Evidence.addMediaToTimeline(
                        mediaId, 
                        timestamp, 
                        url, 
                        file.type.startsWith('image/') ? 'image' : 'video',
                        file.type
                    );
                }
                
                // Clear input
                this.value = '';
            });
        },
        
        // Switch between tabs
        switchTab: function(selectedTab) {
            // Remove active class from all tabs
            this.elements.navTabs.forEach(tab => {
                tab.classList.remove('bg-justice-accent');
                tab.classList.add('text-gray-400');
                tab.classList.remove('text-white');
            });
            
            // Add active class to clicked tab
            selectedTab.classList.add('bg-justice-accent');
            selectedTab.classList.remove('text-gray-400');
            selectedTab.classList.add('text-white');
            
            // Hide all tab contents
            this.elements.tabContents.forEach(content => {
                content.classList.add('hidden');
            });
            
            // Show the selected tab content
            const tabId = selectedTab.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.remove('hidden');
        },
        
        // Handle file input change
        handleFileInputChange: function() {
            const file = this.elements.fileInput.files[0];
            if (!file) {
                this.elements.analyzeBtn.disabled = true;
                return;
            }
            
            this.elements.analyzeBtn.disabled = false;
            
            const fileInfo = `SELECTED: ${file.name} (${this.formatFileSize(file.size)})`;
            this.elements.uploadInfoEl.textContent = fileInfo;
            this.elements.uploadInfoEl.classList.remove('hidden');
        },
        
        // Format file size for display
        formatFileSize: function(bytes) {
            if (bytes < 1024) return bytes + ' B';
            else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
            else return (bytes / 1048576).toFixed(1) + ' MB';
        },
        
        // Show loading spinner with custom text
        showLoading: function(text) {
            this.elements.loadingTextEl.textContent = text;
            this.elements.loadingEl.classList.remove('hidden');
            this.elements.resultsContainer.classList.add('hidden');
        },
        
        // Hide loading spinner
        hideLoading: function() {
            this.elements.loadingEl.classList.add('hidden');
            this.elements.resultsContainer.classList.remove('hidden');
        },
        
        // Display messages based on current filter and pagination
        displayMessages: function() {
            // Calculate page info
            const totalPages = Math.max(1, Math.ceil(AppState.filteredMessages.length / AppState.messagesPerPage));
            AppState.currentPage = Math.min(AppState.currentPage, totalPages);
            
            // Calculate range for current page
            const startIndex = (AppState.currentPage - 1) * AppState.messagesPerPage;
            const endIndex = Math.min(startIndex + AppState.messagesPerPage, AppState.filteredMessages.length);
            
            // Update pagination UI
            this.elements.pageInfoEl.textContent = `Page ${AppState.currentPage} of ${totalPages}`;
            this.elements.prevPageBtn.disabled = AppState.currentPage === 1;
            this.elements.nextPageBtn.disabled = AppState.currentPage === totalPages;
            
            // Update message count
            this.elements.messageCountEl.textContent = `${AppState.filteredMessages.length} messages`;
            
            // Clear current messages
            this.elements.messagesContainer.innerHTML = '';
            
            // Get show media toggle state
            const showMediaInline = this.elements.showMediaInline.checked;
            
            // Generate message rows
            const messagesFragment = document.createDocumentFragment();
            
            for (let i = startIndex; i < endIndex; i++) {
                const msg = AppState.filteredMessages[i];
                const row = document.createElement('tr');
                row.className = 'chat-message border-t border-justice-accent';
                
                // Add selected class if the message is selected
                if (AppState.selectedMessages.has(msg.id)) {
                    row.classList.add('bg-primary', 'bg-opacity-20');
                }
                
                // Add question class if it's a question
                if (msg.isQuestion) {
                    row.classList.add('bg-blue-900', 'bg-opacity-20');
                }
                
                // Check if this message has an associated media file
                const mediaFile = Evidence.findMediaFileForMessage(msg);
                
                // Create table cells
                let contentCell = '';
                
                if (msg.isMedia && showMediaInline) {
                    // If it's a media message and we have an associated media file uploaded
                    if (mediaFile) {
                        if (mediaFile.type.startsWith('image/')) {
                            contentCell = `
                                <div class="flex items-start">
                                    <span class="badge badge-blue mr-2 mt-1">MEDIA</span>
                                    <div>
                                        <div class="mb-2">${this.formatMessage(msg.message)}</div>
                                        <div class="relative w-56 h-40 bg-black rounded-md overflow-hidden">
                                            <img src="${mediaFile.url}" alt="Media content" class="absolute inset-0 w-full h-full object-cover">
                                        </div>
                                    </div>
                                </div>
                            `;
                        } else if (mediaFile.type.startsWith('video/')) {
                            contentCell = `
                                <div class="flex items-start">
                                    <span class="badge badge-blue mr-2 mt-1">MEDIA</span>
                                    <div>
                                        <div class="mb-2">${this.formatMessage(msg.message)}</div>
                                        <div class="relative w-56 h-40 bg-black rounded-md overflow-hidden">
                                            <video class="absolute inset-0 w-full h-full object-cover" controls>
                                                <source src="${mediaFile.url}" type="${mediaFile.type}">
                                                Your browser does not support the video tag.
                                            </video>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }
                    } else {
                        // Media message but no file uploaded
                        contentCell = `
                            <div class="flex items-start">
                                <span class="badge badge-blue mr-2 mt-1">MEDIA</span>
                                ${this.formatMessage(msg.message)}
                            </div>
                        `;
                    }
                } else {
                    // Regular message or media message with toggle off
                    contentCell = `
                        ${msg.isMedia ? '<span class="badge badge-blue">MEDIA</span> ' : ''}
                        ${msg.isQuestion ? '<span class="badge badge-yellow">QUESTION</span> ' : ''}
                        ${this.formatMessage(msg.message)}
                    `;
                }
                
                row.innerHTML = `
                    <td class="py-2 px-3 text-sm font-mono whitespace-nowrap text-gray-400">
                        ${msg.id}
                    </td>
                    <td class="py-2 px-3 text-sm font-mono whitespace-nowrap text-gray-400">
                        ${msg.formattedTimestamp}
                    </td>
                    <td class="py-2 px-3 text-sm font-medium whitespace-nowrap" 
                        onclick="UIController.filterBySubject('${msg.sender}')" style="cursor: pointer" 
                        title="Click to filter messages from this subject">
                        <div class="hover:text-primary transition-colors">${msg.sender}</div>
                    </td>
                    <td class="py-2 px-3 break-words">
                        ${contentCell}
                    </td>
                    <td class="py-2 px-3 whitespace-nowrap">
                        <button class="text-xs text-primary hover:text-primary-light select-msg-btn" data-id="${msg.id}">
                            ${AppState.selectedMessages.has(msg.id) ? 'Deselect' : 'Select'}
                        </button>
                    </td>
                `;
                
                messagesFragment.appendChild(row);
            }
            
            this.elements.messagesContainer.appendChild(messagesFragment);
            
            // Add event listeners to select message buttons
            document.querySelectorAll('.select-msg-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const msgId = e.target.getAttribute('data-id');
                    this.toggleMessageSelection(msgId);
                });
            });
        },
        
        // Toggle message selection for AI analysis
        toggleMessageSelection: function(msgId) {
            if (AppState.selectedMessages.has(msgId)) {
                AppState.selectedMessages.delete(msgId);
            } else {
                AppState.selectedMessages.add(msgId);
            }
            
            // Update display
            this.displayMessages();
            this.updateSelectedMessagesDisplay();
        },
        
        // Update the display of selected messages in AI tab
        updateSelectedMessagesDisplay: function() {
            if (AppState.selectedMessages.size === 0) {
                this.elements.selectedMessagesContainer.innerHTML = '<p class="text-gray-500 italic">No messages selected. Select messages from the Chat Analysis tab.</p>';
                return;
            }
            
            this.elements.selectedMessagesContainer.innerHTML = '';
            const selectedMsgs = AppState.chatMessages.filter(msg => AppState.selectedMessages.has(msg.id));
            
            selectedMsgs.forEach(msg => {
                const msgEl = document.createElement('div');
                msgEl.className = 'mb-2 pb-2 border-b border-justice-accent';
                msgEl.innerHTML = `
                    <div class="flex justify-between">
                        <span class="text-xs text-gray-400">${msg.formattedTimestamp}</span>
                        <span class="text-xs font-medium">${msg.sender}</span>
                    </div>
                    <p class="mt-1">${this.formatMessage(msg.message)}</p>
                `;
                this.elements.selectedMessagesContainer.appendChild(msgEl);
            });
        },
        
        // Filter and display messages based on search and filter criteria
        filterAndDisplayMessages: function() {
            const searchTerm = this.elements.messageSearch.value.toLowerCase();
            const filterType = this.elements.messageFilter.value;
            
            // Show reset button if filtering is active
            if (searchTerm || filterType !== 'all') {
                this.elements.resetFilterBtn.classList.remove('hidden');
            } else {
                this.elements.resetFilterBtn.classList.add('hidden');
            }
            
            AppState.filteredMessages = AppState.chatMessages.filter(msg => {
                // Apply search filter
                const matchesSearch = searchTerm === '' || 
                    msg.message.toLowerCase().includes(searchTerm) ||
                    msg.sender.toLowerCase().includes(searchTerm) ||
                    msg.id.toLowerCase().includes(searchTerm);
                
                // Apply type filter
                let matchesType = true;
                if (filterType === 'questions') {
                    matchesType = msg.isQuestion;
                } else if (filterType === 'phrases') {
                    matchesType = 
                        msg.message.toLowerCase().includes('i love you') ||
                        msg.message.toLowerCase().includes('miss you') ||
                        msg.message.toLowerCase().includes('thank you') ||
                        msg.message.toLowerCase().includes('sorry');
                } else if (filterType === 'media') {
                    matchesType = msg.isMedia;
                }
                
                return matchesSearch && matchesType;
            });
            
            // Reset to first page and display
            AppState.currentPage = 1;
            this.displayMessages();
        },
        
        // Reset all filters and display all messages
        resetAllFilters: function() {
            // Reset search
            this.elements.messageSearch.value = '';
            
            // Reset filter type
            this.elements.messageFilter.value = 'all';
            
            // Reset filtered messages to all messages
            AppState.filteredMessages = [...AppState.chatMessages];
            
            // Remove subject highlighting
            document.querySelectorAll('#participants-list > div').forEach(div => {
                div.classList.remove('bg-primary', 'bg-opacity-20');
            });
            
            // Reset message count text
            this.elements.messageCountEl.textContent = `${AppState.filteredMessages.length} messages`;
            
            // Hide reset button
            this.elements.resetFilterBtn.classList.add('hidden');
            
            // Reset to first page and display
            AppState.currentPage = 1;
            this.displayMessages();
        },
        
        // Filter messages by a specific subject/sender
        filterBySubject: function(subject) {
            // Filter messages directly
            AppState.filteredMessages = AppState.chatMessages.filter(msg => msg.sender === subject);
            
            // Reset to first page and refresh display
            AppState.currentPage = 1;
            this.displayMessages();
            
            // Update message count and indicate which subject is filtered
            this.elements.messageCountEl.textContent = `${AppState.filteredMessages.length} messages from ${subject}`;
            
            // Highlight the selected subject in the subjects list (right panel)
            this.highlightSelectedSubject(subject);
        },
        
        // Highlight the selected subject in the sidebar
        highlightSelectedSubject: function(subject) {
            // Remove highlight from all subjects
            document.querySelectorAll('#participants-list > div').forEach(div => {
                div.classList.remove('bg-primary', 'bg-opacity-20');
            });
            
            // Find the matching subject item and highlight it
            const subjectItems = document.querySelectorAll('#participants-list > div');
            subjectItems.forEach(item => {
                const name = item.querySelector('.font-medium').textContent;
                if (name === subject) {
                    item.classList.add('bg-primary', 'bg-opacity-20');
                }
            });
        },
        
        // Format message for display (handle special characters, emojis, etc.)
        formatMessage: function(message) {
            let formattedMessage = message
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\n/g, '<br>');
            
            // Highlight emojis
            formattedMessage = formattedMessage.replace(
                /([\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}])/gu, 
                '<span class="text-lg">$1</span>'
            );
            
            return formattedMessage;
        }
    };

    // Make UIController globally accessible
    window.UIController = UIController;
})();
