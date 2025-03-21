/**
 * AI Analysis Module
 * 
 * Handles all AI analysis functionality, including message analysis,
 * intent detection, and natural language processing.
 */

// Immediately Invoked Function Expression (IIFE) to avoid global namespace pollution
(function() {
    'use strict';

    // AI Analysis Module
    const AIAnalysis = {
        // Initialize AI analysis module
        init: function() {
            // No specific initialization required currently
        },
        
        // Run AI analysis on selected messages
        runAnalysis: async function() {
            if (AppState.selectedMessages.size === 0) {
                alert("Please select messages to analyze from the Chat Analysis tab.");
                return;
            }
            
            // Show loading state
            UIController.elements.analysisLoading.style.display = 'flex';
            UIController.elements.analysisLoading.classList.remove('hidden');
            UIController.elements.analysisResults.innerHTML = '';
            
            try {
                // Get selected messages
                const selectedMsgs = AppState.chatMessages.filter(msg => AppState.selectedMessages.has(msg.id));
                
                // Get selected options
                const options = {
                    sentiment: document.getElementById('option-sentiment').checked,
                    entities: document.getElementById('option-entities').checked,
                    intent: document.getElementById('option-intent').checked,
                    timeline: document.getElementById('option-timeline').checked
                };
                
                // Get selected model
                const model = document.getElementById('ai-model-select').value;
                
                // Prepare messages for analysis
                const messagesForAnalysis = selectedMsgs
                    .map(msg => `[${msg.formattedTimestamp}] ${msg.sender}: ${msg.message}`)
                    .join('\n\n');
                
                // Create prompt for AI
                const prompt = `You are JUSTICE MINDS, an advanced digital evidence analysis system. Analyze the following WhatsApp chat messages:

CHAT MESSAGES:
${messagesForAnalysis}

REQUESTED ANALYSIS:
${options.sentiment ? '- Sentiment analysis of each message and overall conversation tone' : ''}
${options.entities ? '- Entity recognition (people, places, objects mentioned)' : ''}
${options.intent ? '- Intent detection and motivation analysis' : ''}
${options.timeline ? '- Timeline reconstruction and sequence of events' : ''}

Provide a detailed, professional analysis formatted in Markdown. Focus on factual observations and potential evidentiary value. Include headers, bullet points, and formatting for readability. Your analysis should be suitable for use in a law enforcement or legal context.`;

                // Register handler for AI response
                window.Poe.registerHandler("justice-minds-analysis", (result) => {
                    const message = result.responses[0];
                    
                    if (message.status === "error") {
                        UIController.elements.analysisResults.innerHTML = `<p class="text-red-500">Error: ${message.statusText || "Unknown error occurred"}</p>`;
                        UIController.elements.analysisLoading.classList.add('hidden');
                    } else if (message.status === "incomplete") {
                        // Update with streaming content
                        UIController.elements.analysisResults.innerHTML = marked.parse(message.content);
                    } else if (message.status === "complete") {
                        // Final response
                        UIController.elements.analysisResults.innerHTML = marked.parse(message.content);
                        UIController.elements.analysisLoading.classList.add('hidden');
                    }
                });
                
                // Determine which bot to use based on model selection
                const botPrefix = model.split('/')[0] === 'anthropic' ? '@Claude-3.7-Sonnet' : 
                                  model.split('/')[0] === 'openai' ? '@o3-mini' : '@deepseek-r1-zero';
                
                // Send message to AI
                await window.Poe.sendUserMessage(
                    `${botPrefix} ${prompt}`,
                    {
                        handler: "justice-minds-analysis",
                        stream: true,
                        openChat: false
                    }
                );
                
            } catch (err) {
                UIController.elements.analysisResults.innerHTML = `<p class="text-red-500">Error: ${err.message}</p>`;
                UIController.elements.analysisLoading.classList.add('hidden');
            }
        }
    };

    // Make AIAnalysis globally accessible
    window.AIAnalysis = AIAnalysis;
})();
