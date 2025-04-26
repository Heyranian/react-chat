// embedded.js
window.addEventListener('DOMContentLoaded', (event) => {
    // Create and inject the CSS styles
    const style = document.createElement('style');
    style.innerHTML = `
        /* استایل برای دایره */
        #chat-circle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background-color: #4CAF50;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            color: white;
            font-size: 30px;
            font-weight: bold;
        }

        /* استایل برای ای فریم */
        #iframe-container {
            position: fixed;
            bottom: 100px;
            right: 20px;
            width: 400px;
            height: 300px;
            background-color: white;
            border: 2px solid #ccc;
            display: none;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            z-index: 1000;
        }

        #iframe-container iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
    `;
    document.head.appendChild(style); // Inject styles into the head of the document

    // Create the chat circle div
    const chatCircle = document.createElement('div');
    chatCircle.id = 'chat-circle';
    chatCircle.innerHTML = '💬';
    document.body.appendChild(chatCircle); // Append to body

    // Create the iframe container div
    const iframeContainer = document.createElement('div');
    iframeContainer.id = 'iframe-container';
    const iframe = document.createElement('iframe');
    iframe.src = 'http://localhost:3003/';
    iframe.title = 'چت';
    iframeContainer.appendChild(iframe);
    document.body.appendChild(iframeContainer); // Append to body

    // Toggle iframe visibility on chat circle click
    chatCircle.addEventListener('click', () => {
        iframeContainer.style.display = iframeContainer.style.display === 'none' ? 'block' : 'none';
    });
});
