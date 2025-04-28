(function() {
    // Parse URL parameters
    const scriptTag = document.currentScript;
    const scriptUrl = new URL(scriptTag.src);
    const widgetId = scriptUrl.searchParams.get('widgetId') || '';
    const sessionId = scriptUrl.searchParams.get('session') || generateSessionId();
    
    const userId = scriptTag.getAttribute('data-user-id') || '';
    const userName = scriptTag.getAttribute('data-user-name') || '';
    const userEmail = scriptTag.getAttribute('data-user-email') || '';
    
    console.log('Chat widget initialized:', {
        widgetId,
        sessionId,
        userId,
        userName,
        userEmail
    });
    
    // Generate a random session ID if none provided
    function generateSessionId() {
        return 'session_' + Math.random().toString(36).substring(2, 15);
    }
    
    // Store session ID (send message to parent window)
    if (!scriptUrl.searchParams.get('session')) {
        window.parent.postMessage({
            type: 'STORE_SESSION',
            sessionId: sessionId
        }, '*');
    }
    
    // Create and inject the CSS styles
    const style = document.createElement('style');
    style.innerHTML = `
        #chat-circle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background-color: #db2777;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            color: white;
            font-size: 30px;
            font-weight: bold;
            z-index: 1999999999;
        }
            
        #iframe-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 2000000000;
            width: 366px;
            height: 714px;
            max-height: min(714px, 100% - calc(15px + 15px));
            border-radius: 12px;
            box-shadow: 0 5px 40px rgba(0, 0, 0, .16);
            background-color: white;
            display: none;
            overflow: hidden;
            opacity: 0;
            transform: scale(0.9);
            transform-origin: bottom right;
            transition: opacity 0.1s ease, transform 0.1s ease;
        }

        #iframe-container.show {
            opacity: 1;
            transform: scale(1);
        }

        #iframe-container iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
    `;
    document.head.appendChild(style);

    // Create the chat circle div
    const chatCircle = document.createElement('div');
    chatCircle.id = 'chat-circle';
    chatCircle.innerHTML = `<svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 5C22 6.65685 20.6569 8 19 8C17.3431 8 16 6.65685 16 5C16 3.34315 17.3431 2 19 2C20.6569 2 22 3.34315 22 5Z" fill="white"/>
              <path fill="white" d="M15.6361 2.01096C15.0111 2 14.3051 2 13.5 2H10.5C7.22657 2 5.58985 2 4.38751 2.7368C3.71473 3.14908 3.14908 3.71473 2.7368 4.38751C2 5.58985 2 7.22657 2 10.5V11.5C2 13.8297 2 14.9946 2.3806 15.9134C2.88807 17.1386 3.86144 18.1119 5.08658 18.6194C5.74689 18.8929 6.53422 18.9698 7.78958 18.9915C8.63992 19.0061 9.06509 19.0134 9.40279 19.2098C9.74049 19.4063 9.95073 19.7614 10.3712 20.4718L10.9133 21.3877C11.3965 22.204 12.6035 22.204 13.0867 21.3877L13.6288 20.4718C14.0492 19.7614 14.2595 19.4062 14.5972 19.2098C14.9349 19.0134 15.36 19.0061 16.2104 18.9915C17.4658 18.9698 18.2531 18.8929 18.9134 18.6194C20.1386 18.1119 21.1119 17.1386 21.6194 15.9134C22 14.9946 22 13.8297 22 11.5V10.5C22 9.69494 22 8.98889 21.989 8.36394C21.1942 9.07068 20.1473 9.5 19 9.5C16.5147 9.5 14.5 7.48528 14.5 5C14.5 3.85275 14.9293 2.80577 15.6361 2.01096Z" />
            </svg>`;
    document.body.appendChild(chatCircle);

    // Create the iframe container div
    const iframeContainer = document.createElement('div');
    iframeContainer.id = 'iframe-container';
    const iframe = document.createElement('iframe');
    
    // Pass all data to iframe via URL parameters
    const iframeUrl = new URL('http://localhost:3003');
    iframeUrl.searchParams.set('widgetId', widgetId);
    iframeUrl.searchParams.set('sessionId', sessionId);
    
    iframe.src = iframeUrl.toString();
    iframe.title = 'Chat';
    iframeContainer.appendChild(iframe);
    document.body.appendChild(iframeContainer);

    // Send user data to iframe once it is loaded
    iframe.onload = () => {
        const data = { 
            userId, 
            userName, 
            userEmail,
            sessionId,
            widgetId
        };
        console.log('Sending data to iframe:', data);
        iframe.contentWindow.postMessage(data, '*');
    };

    const toggleIframe = (show) => {
        if (show) {
            iframeContainer.style.display = 'block';
            setTimeout(() => {
                iframeContainer.classList.add('show');
                chatCircle.style.display = 'none';
            }, 10);
        } else {
            iframeContainer.classList.remove('show');
            setTimeout(() => {
                iframeContainer.style.display = 'none';
                chatCircle.style.display = 'flex';
            }, 300);
        }
    };

    chatCircle.addEventListener('click', () => {
        const isVisible = iframeContainer.classList.contains('show');
        toggleIframe(!isVisible);
    });

    document.addEventListener('click', (event) => {
        if (iframeContainer.classList.contains('show') && 
            !iframeContainer.contains(event.target) && 
            event.target !== chatCircle) {
            toggleIframe(false);
        }
    });

    // Listen for close messages from the iframe
    window.addEventListener('message', (event) => {
        // In production, verify the origin
        // if (event.origin !== 'http://localhost:3003') return;
        
        if (event.data === 'closeChat') {
            toggleIframe(false);
        }
    });
})();