if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

import { geminiApiKey } from './env.js';

document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0);

    // --- Intersection Observer for Scroll Animations ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show-element');
                
                // Trigger number counter if it's a stat box
                if(entry.target.classList.contains('hub-stats')) {
                    const counters = entry.target.querySelectorAll('.stat-number');
                    counters.forEach(counter => {
                        const target = +counter.getAttribute('data-target');
                        animateCounter(counter, target);
                    });
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with hidden-element class
    document.querySelectorAll('.hidden-element').forEach(el => {
        observer.observe(el);
    });

    // --- Number Counter Animation ---
    function animateCounter(element, target) {
        let current = 0;
        const increment = target / 50; // Adjust for speed
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                element.innerText = Math.ceil(current);
                setTimeout(updateCounter, 30);
            } else {
                element.innerText = target;
            }
        };
        updateCounter();
    }


    // --- Mock Data Fallback ---
    const mockData = [
        {
            id: 1, type: 'news', title: 'World\'s Largest Green Hydrogen Plant Opens',
            date: 'Today', desc: 'A massive 250MW electrolyser facility has officially commenced operations...',
            image: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url("hydrogen_plant.png")',
            link: '#'
        },
        {
            id: 2, type: 'ideas', title: 'Solid-State Hydrogen Storage: A Game Changer?',
            date: 'Today', desc: 'Researchers have published a new concept utilizing magnesium hydride to store hydrogen safely...',
            image: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url("hydrogen_car.png")',
            link: '#'
        },
        {
            id: 3, type: 'news', title: 'Automakers Commit to Fuel Cell Truck Fleets',
            date: 'Yesterday', desc: 'A consortium of five leading truck manufacturers has signed an accord to transition...',
            image: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url("hydrogen_car.png")',
            link: '#'
        },
        {
            id: 4, type: 'ideas', title: 'Ocean-Based Electrolysis: Harvesting Fuel at Sea',
            date: 'Yesterday', desc: 'A striking new concept proposes floating offshore platforms that use wave energy...',
            image: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url("hydrogen_plant.png")',
            link: '#'
        },
        {
            id: 5, type: 'news', title: 'Aviation Giant Tests Liquid Hydrogen Engine',
            date: '2 Days Ago', desc: 'A modified commercial jet engine ran for 3 hours solely on liquid hydrogen...',
            image: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url("hydrogen_car.png")',
            link: '#'
        },
        {
            id: 6, type: 'ideas', title: 'Photosynthetic Bacteria: Bio-Hydrogen Production',
            date: '3 Days Ago', desc: 'Synthetic biologists are modifying cyanobacteria strains to continuously excrete hydrogen...',
            image: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url("hydrogen_plant.png")',
            link: '#'
        }
    ];

    let currentData = [];
    const newsContainer = document.getElementById('news-container');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // --- Dynamic Data Fetching from Real News Platform ---
    async function fetchDynamicNews() {
        // Using The Guardian's open API to get reliable news with authentic images
        const API_URL = 'https://content.guardianapis.com/search?q=hydrogen%20fuel%20energy&show-fields=thumbnail,headline,trailText&page-size=12&api-key=test';

        try {
            newsContainer.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-secondary);">Loading latest updates...</p>';
            
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            
            if (data.response && data.response.results && data.response.results.length > 0) {
                const results = data.response.results;
                
                // Filter out results that don't have a thumbnail to ensure we only show cards with images
                const resultsWithImages = results.filter(item => item.fields && item.fields.thumbnail);

                currentData = resultsWithImages.slice(0, 6).map((item, index) => {
                    const isIdea = item.fields.headline.toLowerCase().includes('concept') || 
                                   item.fields.headline.toLowerCase().includes('research') || 
                                   item.fields.headline.toLowerCase().includes('future') ||
                                   index % 3 === 0; 
                                   
                    // Directly use the high quality image from the news publisher
                    const realImage = item.fields.thumbnail;
                    const bgImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url('${realImage}')`;
                    
                    return {
                        id: index + 1,
                        type: isIdea ? 'ideas' : 'news',
                        title: item.fields.headline,
                        date: new Date(item.webPublicationDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                        desc: (item.fields.trailText || '').replace(/<[^>]*>?/gm, '').substring(0, 110) + '...',
                        image: bgImage,
                        link: item.webUrl
                    };
                });
            } else {
                currentData = mockData;
            }
        } catch (error) {
            console.error('Error fetching dynamic news:', error);
            currentData = mockData;
        }
        
        // Ensure active filter is applied on load
        const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
        renderNews(activeFilter);
    }

    // --- Render News Cards ---
    function renderNews(filterType) {
        newsContainer.innerHTML = ''; 

        const filteredData = filterType === 'all' 
            ? currentData 
            : currentData.filter(item => item.type === filterType);

        if(filteredData.length === 0) {
             newsContainer.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-secondary);">No updates found for this category.</p>';
             return;
        }

        filteredData.forEach((item, index) => {
            const delayClass = `delay-${(index % 3) + 1}`; 
            
            const card = document.createElement('div');
            card.className = `news-card hidden-element ${delayClass}`;
            
            card.innerHTML = `
                <div class="news-image" style="background-image: ${item.image}">
                    <span class="news-tag">${item.type === 'news' ? 'Global News' : 'New Idea'}</span>
                </div>
                <div class="news-content">
                    <span class="news-date">${item.date}</span>
                    <h3 class="news-title">${item.title}</h3>
                    <p class="news-desc">${item.desc}</p>
                    <a href="${item.link}" target="_blank" class="read-more">Read Full Story <span>→</span></a>
                </div>
            `;
            
            newsContainer.appendChild(card);
            
            setTimeout(() => observer.observe(card), 10);
        });
    }

    // Initialize fetching
    fetchDynamicNews();

    // --- Filter functionality ---
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from all
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add to clicked
            e.target.classList.add('active');
            
            const filterValue = e.target.getAttribute('data-filter');
            renderNews(filterValue);
        });
    });

    // --- Navbar Scroll Effect ---
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(10, 10, 15, 0.9)';
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
        } else {
            navbar.style.background = 'rgba(10, 10, 15, 0.7)';
            navbar.style.boxShadow = 'none';
        }
    });

    // --- Chatbot Logic ---
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotPanel = document.getElementById('chatbot-panel');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatInputForm = document.getElementById('chat-input-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    let chatHistory = [];

    chatbotToggle.addEventListener('click', () => {
        chatbotPanel.classList.remove('hidden');
    });

    chatbotClose.addEventListener('click', () => {
        chatbotPanel.classList.add('hidden');
    });

    function appendMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}-message`;
        msgDiv.innerHTML = `<p>${text}</p>`;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showLoading() {
        const loader = document.createElement('div');
        loader.className = 'message ai-message loading-msg';
        loader.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
        chatMessages.appendChild(loader);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return loader;
    }

    async function callGeminiAPI(userText) {
        const apiKey = geminiApiKey;
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        chatHistory.push({ role: 'user', parts: [{ text: userText }] });

        const requestBody = {
            system_instruction: {
                parts: { text: "You are an AI assistant specifically built for a website called HydroHub. Your ONLY purpose is to answer questions related to hydrogen fuel, clean energy, fuel cells, and related technologies. Keep your answers extremely short, crisp, and easy to understand (1-3 sentences max). Most importantly: BE DEFINITIVE AND GIVE CONCRETE NUMBERS. Do NOT hedge or say 'it varies', 'it depends', or 'costs vary'. Instead, provide realistic average numerical estimates, prices, or ranges based on the US/Global market in 2024. If the user asks for a rate or cost, give them an actual dollar amount. If the user asks about ANYTHING else (e.g. coding, general history, recipes, math, etc), politely decline and remind them you can only answer questions about hydrogen and clean energy." }
            },
            contents: chatHistory
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                if (response.status === 400) {
                    return "Invalid API Key. Please verify the key provided in the source code.";
                }
                throw new Error('API Request Failed');
            }

            const data = await response.json();
            const aiText = data.candidates[0].content.parts[0].text;
            chatHistory.push({ role: 'model', parts: [{ text: aiText }] });
            return aiText;

        } catch (error) {
            console.error("Gemini API Error:", error);
            return "Sorry, I am having trouble connecting to the network right now.";
        }
    }

    if (chatInputForm) {
        chatInputForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = chatInput.value.trim();
            if (!text) return;

            chatInput.value = '';
            appendMessage(text, 'user');

            const loader = showLoading();
            const responseText = await callGeminiAPI(text);
            
            loader.remove();
            // Simple markdown to HTML conversion for bold text
            const formattedText = responseText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            appendMessage(formattedText, 'ai');
        });
    }
});

    // --- Research Papers Fetching ---
    const researchContainer = document.getElementById('research-container');

    async function fetchResearchPapers() {
        if (!researchContainer) return;

        // Fetching 6 recent papers about hydrogen fuel and green energy using OpenAlex API
        const API_URL = 'https://api.openalex.org/works?search=hydrogen%20fuel%20cell&per-page=6&sort=publication_date:desc';

        try {
            researchContainer.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-secondary);">Loading latest academic papers...</p>';
            
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                const results = data.results;
                researchContainer.innerHTML = '';
                
                results.forEach((item, index) => {
                    const delayClass = `delay-${(index % 3) + 1}`; 
                    
                    const title = item.title || 'Untitled Research Paper';
                    
                    // OpenAlex authors format mapping
                    let authors = 'Various Authors';
                    if (item.authorships && item.authorships.length > 0) {
                        authors = item.authorships.map(a => a.author.display_name).join(', ');
                    }
                    
                    const pubYear = item.publication_year || 'Recent';
                    const readLink = item.doi || item.id || '#';

                    // Provide a default description if abstract isn't easily available
                    let abstract = 'Read this peer-reviewed academic paper exploring recent advancements in hydrogen technology, production methods, and its role in the clean energy economy.';
                    
                    const card = document.createElement('div');
                    card.className = `research-card glass-card ${delayClass}`;
                    
                    card.innerHTML = `
                        <div>
                            <h3>${title}</h3>
                            <div class="research-authors">${authors.substring(0, 60)}${authors.length > 60 ? '...' : ''}</div>
                            <p class="research-abstract">${abstract}</p>
                        </div>
                        <div class="research-footer">
                            <span class="research-date">Published: ${pubYear}</span>
                            <a href="${readLink}" target="_blank" class="btn-outline">Read Paper <span>↗</span></a>
                        </div>
                    `;
                    
                    researchContainer.appendChild(card);
                });
            } else {
                researchContainer.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-secondary);">No recent papers found.</p>';
            }
        } catch (error) {
            console.error('Error fetching research papers:', error);
            researchContainer.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-secondary);">Failed to load academic papers. Please try again later.</p>';
        }
    }

    fetchResearchPapers();
