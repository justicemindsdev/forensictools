/**
 * Evidence Module
 * 
 * Handles evidence management, media files, timeline data,
 * and claim tracking functionality.
 */

// Immediately Invoked Function Expression (IIFE) to avoid global namespace pollution
(function() {
    'use strict';

    // Evidence Module
    const Evidence = {
        // Initialize evidence module
        init: function() {
            // No specific initialization required currently
        },
        
        // Find media file associated with a message
        findMediaFileForMessage: function(message) {
            // This is where we would match uploaded media with the message based on metadata
            // For the demo, we'll use a simplified approach based on the message ID
            
            // In a real implementation, this would use EXIF data from the media files
            // to match timestamps with message timestamps
            
            // Get all uploaded media files
            const mediaItems = document.querySelectorAll('#media-gallery > div');
            
            // For demo purposes, we'll just return the first media item if it's a media message
            if (message.isMedia && mediaItems.length > 0) {
                const mediaId = mediaItems[0].querySelector('h3').textContent.split(' ')[1];
                const mediaElement = mediaItems[0].querySelector('img, video');
                
                if (mediaElement) {
                    const isVideo = mediaElement.tagName.toLowerCase() === 'video';
                    const url = isVideo ? 
                        mediaElement.querySelector('source').src : 
                        mediaElement.src;
                    
                    return {
                        id: mediaId,
                        url: url,
                        type: isVideo ? 'video/mp4' : 'image/jpeg'
                    };
                }
            }
            
            return null;
        },
        
        // Query evidence using AI
        queryEvidence: async function() {
            const query = UIController.elements.evidenceQuery.value.trim();
            if (!query) return;
            
            // Show loading state
            UIController.elements.queryResult.classList.remove('hidden');
            UIController.elements.aiResponse.innerHTML = '<div class="flex justify-center py-4"><div class="loading-spinner"></div></div>';
            
            try {
                // Compile evidence for context
                const evidenceContext = Array.from(document.querySelectorAll('.evidence-container'))
                    .map(item => {
                        const id = item.id.replace('evidence-', '');
                        const timestamp = item.querySelector('.text-xs').textContent.replace('TIMESTAMP: ', '');
                        const content = item.querySelector('p').textContent;
                        return `[${id}] ${timestamp}: ${content}`;
                    })
                    .join('\n\n');
                
                // Create prompt for AI
                const prompt = `You are JUSTICE MINDS, an advanced evidence analysis system. Analyze the following WhatsApp chat evidence and answer this question:
                
                QUESTION: ${query}
                
                EVIDENCE:
                ${evidenceContext}
                
                Provide a concise, professional response that references specific evidence IDs when relevant. Format your response in a formal, authoritative style suitable for law enforcement or legal professionals.`;
                
                // Send to Claude-3.7-Sonnet for analysis
                if (!window.Poe) {
                    UIController.elements.aiResponse.innerHTML = '<p class="text-red-500">Error: Poe API not available.</p>';
                    return;
                }
                
                // Register handler for AI response
                window.Poe.registerHandler("evidence-query-handler", (result) => {
                    const message = result.responses[0];
                    
                    if (message.status === "error") {
                        UIController.elements.aiResponse.innerHTML = `<p class="text-red-500">Error: ${message.statusText || "Unknown error occurred"}</p>`;
                    } else if (message.status === "incomplete") {
                        // Update with streaming content
                        UIController.elements.aiResponse.innerHTML = marked.parse(message.content);
                    } else if (message.status === "complete") {
                        // Final response
                        UIController.elements.aiResponse.innerHTML = marked.parse(message.content);
                    }
                });
                
                // Send message to AI
                await window.Poe.sendUserMessage(
                    "@Claude-3.7-Sonnet " + prompt,
                    {
                        handler: "evidence-query-handler",
                        stream: true,
                        openChat: false
                    }
                );
                
            } catch (err) {
                UIController.elements.aiResponse.innerHTML = `<p class="text-red-500">Error: ${err.message}</p>`;
            }
        },
        
        // Highlight evidence items
        highlightEvidence: function(evidenceIds) {
            // Remove highlight from all evidence items
            document.querySelectorAll('.evidence-container').forEach(item => {
                item.classList.remove('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-justice');
            });
            
            // Add highlight to selected evidence items
            evidenceIds.forEach(id => {
                const item = document.getElementById(`evidence-${id}`);
                if (item) {
                    item.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-justice');
                    item.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        },
        
        // Add new claim
        addNewClaim: function() {
            // This is a placeholder function - in a real app, this would open a form or modal
            const claimsList = document.querySelector('.bg-justice-light .space-y-4');
            const newClaimEl = document.createElement('div');
            newClaimEl.className = 'bg-justice p-4 rounded-md';
            newClaimEl.innerHTML = `
                <div class="flex justify-between items-start">
                    <h3 class="font-medium">New Claim</h3>
                    <span class="badge badge-red">Draft</span>
                </div>
                <p class="mt-2 text-sm text-gray-300">Click to edit this claim and add supporting evidence.</p>
                <div class="mt-3 flex justify-between text-xs text-gray-400">
                    <span>REFERENCE: Pending</span>
                    <button class="text-primary hover:text-primary-light">Edit Claim</button>
                </div>
            `;
            claimsList.insertBefore(newClaimEl, document.getElementById('add-claim-btn'));
        },
        
        // Upload media files
        uploadMedia: function() {
            const files = UIController.elements.mediaInput.files;
            if (!files || files.length === 0) {
                alert("Please select media files to upload.");
                return;
            }
            
            const gallery = document.getElementById('media-gallery');
            
            // Process each file
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) continue;
                
                const mediaId = `JM-M${(i + 3).toString().padStart(3, '0')}`;
                
                // Attempt to extract EXIF metadata (for images)
                let timestamp = '';
                if (file.type.startsWith('image/')) {
                    // In a real implementation, we would use EXIF.js or similar to extract metadata
                    // For demo, we'll use a timestamp close to chat messages
                    const demoTimestamps = [
                        "2020-10-19 18:15:22",
                        "2020-10-19 18:17:45",
                        "2020-10-19 19:05:12"
                    ];
                    timestamp = demoTimestamps[i % demoTimestamps.length];
                } else {
                    // For videos or when EXIF is not available
                    const now = new Date();
                    timestamp = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
                }
                
                const mediaEl = document.createElement('div');
                mediaEl.className = 'bg-justice p-4 rounded-lg shadow-md';
                mediaEl.dataset.timestamp = timestamp; // Store timestamp for matching
                
                if (file.type.startsWith('image/')) {
                    // Create image preview
                    const imageUrl = URL.createObjectURL(file);
                    mediaEl.innerHTML = `
                        <div class="relative pb-[75%] bg-black rounded-md overflow-hidden mb-2">
                            <img src="${imageUrl}" alt="Uploaded evidence" class="absolute inset-0 w-full h-full object-cover">
                            <div class="absolute top-2 right-2 bg-justice-dark bg-opacity-75 px-2 py-1 rounded text-xs font-medium">
                                PHOTO
                            </div>
                        </div>
                        <div>
                            <h3 class="font-medium text-sm mb-1">EXHIBIT ${mediaId}</h3>
                            <p class="text-xs text-gray-400">Timestamp from metadata • ${timestamp}</p>
                            <div class="flex justify-between mt-2">
                                <button class="text-xs text-primary hover:text-primary-light">View Details</button>
                                <button class="text-xs text-primary hover:text-primary-light" onclick="Evidence.addMediaToTimeline('${mediaId}', '${timestamp}', '${imageUrl}', 'image')">Add to Timeline</button>
                            </div>
                        </div>
                    `;
                } else if (file.type.startsWith('video/')) {
                    // Create video preview
                    const videoUrl = URL.createObjectURL(file);
                    mediaEl.innerHTML = `
                        <div class="relative pb-[75%] bg-black rounded-md overflow-hidden mb-2">
                            <video class="absolute inset-0 w-full h-full object-cover" controls>
                                <source src="${videoUrl}" type="${file.type}">
                                Your browser does not support the video tag.
                            </video>
                            <div class="absolute top-2 right-2 bg-justice-dark bg-opacity-75 px-2 py-1 rounded text-xs font-medium">
                                VIDEO
                            </div>
                        </div>
                        <div>
                            <h3 class="font-medium text-sm mb-1">EXHIBIT ${mediaId}</h3>
                            <p class="text-xs text-gray-400">Timestamp from metadata • ${timestamp}</p>
                            <div class="flex justify-between mt-2">
                                <button class="text-xs text-primary hover:text-primary-light">View Details</button>
                                <button class="text-xs text-primary hover:text-primary-light" onclick="Evidence.addMediaToTimeline('${mediaId}', '${timestamp}', '${videoUrl}', 'video', '${file.type}')">Add to Timeline</button>
                            </div>
                        </div>
                    `;
                }
                
                gallery.appendChild(mediaEl);
            }
            
            // Clear input
            UIController.elements.mediaInput.value = '';
            
            // Notify user
            alert("Media files uploaded. You can now toggle 'Show Media' in the Chat Analysis tab to view media inline, or click 'Add to Timeline' to integrate with the chat sequence.");
        },
        
        // Add media to chat timeline
        addMediaToTimeline: function(mediaId, timestamp, url, type, mimeType = '') {
            // Create a new "virtual" message that represents the media
            const mediaMessage = {
                id: mediaId,
                sender: "SYSTEM",
                message: `<Media from ${mediaId}>`,
                timestamp: new Date(timestamp),
                formattedTimestamp: timestamp,
                isMedia: true,
                isQuestion: false,
                mediaDetails: {
                    id: mediaId,
                    url: url,
                    type: type,
                    mimeType: mimeType
                }
            };
            
            // Add to chat messages
            AppState.chatMessages.push(mediaMessage);
            
            // Sort messages by timestamp to integrate into timeline
            AppState.chatMessages.sort((a, b) => a.timestamp - b.timestamp);
            
            // Update filtered messages
            AppState.filteredMessages = [...AppState.chatMessages];
            
            // Reset to first page and refresh display
            AppState.currentPage = 1;
            UIController.displayMessages();
            
            // Notify user
            alert(`Media ${mediaId} has been added to the chat timeline.`);
        }
    };

    // Make Evidence module globally accessible
    window.Evidence = Evidence;

    // Create global function for evidence highlighting (needed for onclick attributes)
    window.highlightEvidence = Evidence.highlightEvidence;
})();
