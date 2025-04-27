import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './Chat.css';

function Chat({ apiUrl = 'http://192.168.0.231:4444/query', userId: propUserId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId] = useState(propUserId || 'کاربر ' + Math.random().toString(36).substr(2, 9));
  const [chatStarted, setChatStarted] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e, questionText = null) => {
    setInput('')
    if (e) e.preventDefault();
    const messageText = questionText || input;
    if (!messageText.trim()) return;

    if (!chatStarted) {
      setChatStarted(true);
    }

    const userMessage = {
      userId,
      text: messageText,
      type: 'sent',
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: messageText, pr_rand_id: "1" }),
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      const apiMessage = {
        userId: 'پشتیبان فنی',
        text: data.answer || 'پاسخی از سرویس دهنده دریافت نشد',
        type: 'received',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, apiMessage]);
    } catch (error) {
      const errorMessage = {
        userId: 'پشتیبان فنی',
        text: 'عدم موفقیت در دریافت پاسخ از سرور پشتیبان',
        type: 'received',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsLoading(false);
    setInput('');
    scrollToBottom();
  };

  const suggestedQuestions = [
    'آیا نمره بدتر توی ترمیم لحاظ میشه؟',
    'سوابق تحصیلی در سال ۱۴۰۴ چطور اثر می‌گذاره؟',
    'غیبت در آزمون ایجاد سابقه چه تأثیری داره؟',
    'اگر دو تا دیپلم داشته باشم، نمره کل چطور حساب میشه؟'
  ];

  const handlePredefinedQuestion = (question) => {
    sendMessage(null, question);
  };

  const startChat = () => {
    setChatStarted(true);
    setMessages([
      {
        userId: 'chatbot',
        text: 'هر سوالی از ترمیم نمرات داری ازم بپرس 👋',
        type: 'received',
        timestamp: new Date().toISOString(),
      }
    ]);
  };

  const handleClose = () => {
    window.parent.postMessage('closeChat', '*');
  };

  if (!chatStarted) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-pink-600 to-white flex flex-col p-3" dir="rtl">
        <div className="flex items-center justify-between text-white">
          <div className="w-10 h-10 flex items-center justify-center">
            <svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 5C22 6.65685 20.6569 8 19 8C17.3431 8 16 6.65685 16 5C16 3.34315 17.3431 2 19 2C20.6569 2 22 3.34315 22 5Z" fill="white"/>
              <path className="fill-pink-900" opacity="0.8" d="M15.6361 2.01096C15.0111 2 14.3051 2 13.5 2H10.5C7.22657 2 5.58985 2 4.38751 2.7368C3.71473 3.14908 3.14908 3.71473 2.7368 4.38751C2 5.58985 2 7.22657 2 10.5V11.5C2 13.8297 2 14.9946 2.3806 15.9134C2.88807 17.1386 3.86144 18.1119 5.08658 18.6194C5.74689 18.8929 6.53422 18.9698 7.78958 18.9915C8.63992 19.0061 9.06509 19.0134 9.40279 19.2098C9.74049 19.4063 9.95073 19.7614 10.3712 20.4718L10.9133 21.3877C11.3965 22.204 12.6035 22.204 13.0867 21.3877L13.6288 20.4718C14.0492 19.7614 14.2595 19.4062 14.5972 19.2098C14.9349 19.0134 15.36 19.0061 16.2104 18.9915C17.4658 18.9698 18.2531 18.8929 18.9134 18.6194C20.1386 18.1119 21.1119 17.1386 21.6194 15.9134C22 14.9946 22 13.8297 22 11.5V10.5C22 9.69494 22 8.98889 21.989 8.36394C21.1942 9.07068 20.1473 9.5 19 9.5C16.5147 9.5 14.5 7.48528 14.5 5C14.5 3.85275 14.9293 2.80577 15.6361 2.01096Z" />
            </svg>
          </div>
          <button className="text-2xl hover:bg-pink-900 rounded-full px-2.5 py-0 flex items-center justify-center" onClick={handleClose}>
            <span className="pb-1">×</span>
          </button>
        </div>
        
        <div className="text-center text-white text-xl mt-4 mb-6">به پشتیبان هوش مصنوعی خوش آمدید</div>
        
        <div className="bg-white rounded-xl flex p-3 shadow-md">
          
          <div className="divide-y divide-gray-300 divide-solid w-full overflow-y-auto custom-scrollbar max-h-[250px] text-sm text-right">
            {suggestedQuestions.map((question, index) => (
              <div 
                key={index} 
                className="flex items-center cursor-pointer p-2"
                onClick={() => handlePredefinedQuestion(question)}
              >
                <div className="ml-3 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
                <div className="text-gray-800">{question}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex-1"></div>
        <div className="bg-white rounded-xl p-4 flex flex-col pb-0">
          
          <button 
            className="flex items-center justify-between bg-pink-600 rounded-xl text-white py-3 px-3 font-bold"
            onClick={startChat}
          >
            <span>شروع گفتگو</span>
            <div className="mr-3 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          </button>
          
          <div className="flex justify-center mt-6 text-sm">

            <div className="flex flex-row items-center text-pink-600 border-l px-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              </div>
              <span>خانه</span>
            </div>
            
            <div className="flex flex-row items-center relative px-3 cursor-pointer" onClick={startChat}>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <div className="absolute top-0 right-3 w-2 h-2 bg-red-500 rounded-full"></div>
              <span>پیام رسان</span>
            </div>
            
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-white" dir="rtl">
      {/* Header */}
      <div className="bg-pink-600 p-4 flex items-center justify-between text-white">
        

        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 flex items-center justify-center">
              <svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 5C22 6.65685 20.6569 8 19 8C17.3431 8 16 6.65685 16 5C16 3.34315 17.3431 2 19 2C20.6569 2 22 3.34315 22 5Z" fill="white"/>
                <path className="fill-pink-900" opacity="0.8" d="M15.6361 2.01096C15.0111 2 14.3051 2 13.5 2H10.5C7.22657 2 5.58985 2 4.38751 2.7368C3.71473 3.14908 3.14908 3.71473 2.7368 4.38751C2 5.58985 2 7.22657 2 10.5V11.5C2 13.8297 2 14.9946 2.3806 15.9134C2.88807 17.1386 3.86144 18.1119 5.08658 18.6194C5.74689 18.8929 6.53422 18.9698 7.78958 18.9915C8.63992 19.0061 9.06509 19.0134 9.40279 19.2098C9.74049 19.4063 9.95073 19.7614 10.3712 20.4718L10.9133 21.3877C11.3965 22.204 12.6035 22.204 13.0867 21.3877L13.6288 20.4718C14.0492 19.7614 14.2595 19.4062 14.5972 19.2098C14.9349 19.0134 15.36 19.0061 16.2104 18.9915C17.4658 18.9698 18.2531 18.8929 18.9134 18.6194C20.1386 18.1119 21.1119 17.1386 21.6194 15.9134C22 14.9946 22 13.8297 22 11.5V10.5C22 9.69494 22 8.98889 21.989 8.36394C21.1942 9.07068 20.1473 9.5 19 9.5C16.5147 9.5 14.5 7.48528 14.5 5C14.5 3.85275 14.9293 2.80577 15.6361 2.01096Z" />
              </svg>
          </div>
          
          <div className="flex flex-col items-start">
            <div className="font-bold text-sm">پشتیبانی سامانه ترمیم</div>
            <div className="text-xs">پاسخگوی سوالات شما هستم</div>
          </div>
        </div>

        <div className="flex items-center">  
          <button className="hover:bg-pink-900 rounded-full p-1.5" onClick={handleClose}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button className="hover:bg-pink-900 rounded-full p-1.5" >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        </div>
        
        
      </div>

      {/* Chat Service Info */}
      <div className="p-2 border-b flex items-center">
        <div className="flex gap-1">
          <div className="w-9 h-5 rounded-full flex items-center justify-center text-white font-bold">
          <svg width="25px" height="25px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path className="stroke-yellow-500" d="M12 8L12 13" strokeWidth="2" strokeLinecap="round"/>
            <path className="stroke-yellow-500" d="M12 16V15.9888"strokeWidth="2" strokeLinecap="round"/>
            <path className="stroke-yellow-500" d="M3 12C3 4.5885 4.5885 3 12 3C19.4115 3 21 4.5885 21 12C21 19.4115 19.4115 21 12 21C4.5885 21 3 19.4115 3 12Z" strokeWidth="2"/>
          </svg>
          </div>

        </div>
        <div className="text-xs text-gray-400">پاسخ‌ها توسط هوش مصنوعی تهیه شده‌ و امکان خطا وجود دارد</div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 custom-scrollbar">
        <style jsx="true">{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background:#dfdfdf;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #dfdfdf;
          }
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #dfdfdf #f1f1f1;
          }
        `}</style>
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.type === 'sent' ? 'justify-start' : 'justify-end'}`}>
            
            <div className={`flex flex-col max-w-[75%] gap-2`}>
              <div className={`flex gap-2 items-center ${msg.type === 'sent' ? 'justify-start' : 'justify-end'}`}>
                <span className={`text-xs font-semibold mb-1 ${msg.type === 'sent' ? 'text-right' : 'text-left'}`}>
                  {(msg.userId === 'chatbot') ? 'هوش مصنوعی' : msg.userId }
                </span>
                {msg.type === 'received' && (
                  <div>
                    <div className={msg.userId === 'chatbot' 
                      ? "w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center text-white font-bold" 
                     
                      : "w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold"}
                    >
                      {msg.userId === 'chatbot' ? 
                      
                      <svg 
                      width="30"
                      height="30"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M14.1254 13H10.1254V15H14.1254V13Z" className="fill-white" />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M8.12537 13C9.22994 13 10.1254 12.1046 10.1254 11C10.1254 9.89543 9.22994 9 8.12537 9C7.0208 9 6.12537 9.89543 6.12537 11C6.12537 12.1046 7.0208 13 8.12537 13ZM8.12537 11.5C8.40151 11.5 8.62537 11.2761 8.62537 11C8.62537 10.7239 8.40151 10.5 8.12537 10.5C7.84922 10.5 7.62537 10.7239 7.62537 11C7.62537 11.2761 7.84922 11.5 8.12537 11.5Z"
                        className="fill-white"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M18.1254 11C18.1254 12.1046 17.2299 13 16.1254 13C15.0208 13 14.1254 12.1046 14.1254 11C14.1254 9.89543 15.0208 9 16.1254 9C17.2299 9 18.1254 9.89543 18.1254 11ZM16.6254 11C16.6254 11.2761 16.4015 11.5 16.1254 11.5C15.8492 11.5 15.6254 11.2761 15.6254 11C15.6254 10.7239 15.8492 10.5 16.1254 10.5C16.4015 10.5 16.6254 10.7239 16.6254 11Z"
                        className="fill-white"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M2.74884 14.6663C3.73056 16.6421 5.76939 18 8.12537 18H16.1254C18.5654 18 20.6652 16.5435 21.6029 14.4525C22.3722 13.9093 22.8746 13.0133 22.8746 12C22.8746 10.9867 22.3722 10.0907 21.6029 9.54753C20.6652 7.45651 18.5654 6 16.1254 6H8.12537C5.76939 6 3.73056 7.3579 2.74884 9.33375C1.78448 9.83263 1.12537 10.8393 1.12537 12C1.12537 13.1607 1.78448 14.1674 2.74884 14.6663ZM8.12537 8H16.1254C17.5088 8 18.7282 8.70234 19.4465 9.76991C19.7227 10.4593 19.8746 11.2119 19.8746 12C19.8746 12.7881 19.7227 13.5407 19.4465 14.2301C18.7282 15.2977 17.5088 16 16.1254 16H8.12537C5.91623 16 4.12537 14.2091 4.12537 12C4.12537 9.79086 5.91623 8 8.12537 8Z"
                        className="fill-white"
                      />
                    </svg> :
                      <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.0867 21.3877L13.7321 21.7697L13.0867 21.3877ZM13.6288 20.4718L12.9833 20.0898L13.6288 20.4718ZM10.3712 20.4718L9.72579 20.8539H9.72579L10.3712 20.4718ZM10.9133 21.3877L11.5587 21.0057L10.9133 21.3877ZM1.25 10.5C1.25 10.9142 1.58579 11.25 2 11.25C2.41421 11.25 2.75 10.9142 2.75 10.5H1.25ZM3.07351 15.6264C2.915 15.2437 2.47627 15.062 2.09359 15.2205C1.71091 15.379 1.52918 15.8177 1.68769 16.2004L3.07351 15.6264ZM7.78958 18.9915L7.77666 19.7413L7.78958 18.9915ZM5.08658 18.6194L4.79957 19.3123H4.79957L5.08658 18.6194ZM21.6194 15.9134L22.3123 16.2004V16.2004L21.6194 15.9134ZM16.2104 18.9915L16.1975 18.2416L16.2104 18.9915ZM18.9134 18.6194L19.2004 19.3123H19.2004L18.9134 18.6194ZM19.6125 2.7368L19.2206 3.37628L19.6125 2.7368ZM21.2632 4.38751L21.9027 3.99563V3.99563L21.2632 4.38751ZM4.38751 2.7368L3.99563 2.09732V2.09732L4.38751 2.7368ZM2.7368 4.38751L2.09732 3.99563H2.09732L2.7368 4.38751ZM9.40279 19.2098L9.77986 18.5615L9.77986 18.5615L9.40279 19.2098ZM13.7321 21.7697L14.2742 20.8539L12.9833 20.0898L12.4412 21.0057L13.7321 21.7697ZM9.72579 20.8539L10.2679 21.7697L11.5587 21.0057L11.0166 20.0898L9.72579 20.8539ZM12.4412 21.0057C12.2485 21.3313 11.7515 21.3313 11.5587 21.0057L10.2679 21.7697C11.0415 23.0767 12.9585 23.0767 13.7321 21.7697L12.4412 21.0057ZM10.5 2.75H13.5V1.25H10.5V2.75ZM21.25 10.5V11.5H22.75V10.5H21.25ZM7.8025 18.2416C6.54706 18.2199 5.88923 18.1401 5.37359 17.9265L4.79957 19.3123C5.60454 19.6457 6.52138 19.7197 7.77666 19.7413L7.8025 18.2416ZM1.68769 16.2004C2.27128 17.6093 3.39066 18.7287 4.79957 19.3123L5.3736 17.9265C4.33223 17.4951 3.50486 16.6678 3.07351 15.6264L1.68769 16.2004ZM21.25 11.5C21.25 12.6751 21.2496 13.5189 21.2042 14.1847C21.1592 14.8438 21.0726 15.2736 20.9265 15.6264L22.3123 16.2004C22.5468 15.6344 22.6505 15.0223 22.7007 14.2868C22.7504 13.5581 22.75 12.6546 22.75 11.5H21.25ZM16.2233 19.7413C17.4786 19.7197 18.3955 19.6457 19.2004 19.3123L18.6264 17.9265C18.1108 18.1401 17.4529 18.2199 16.1975 18.2416L16.2233 19.7413ZM20.9265 15.6264C20.4951 16.6678 19.6678 17.4951 18.6264 17.9265L19.2004 19.3123C20.6093 18.7287 21.7287 17.6093 22.3123 16.2004L20.9265 15.6264ZM13.5 2.75C15.1512 2.75 16.337 2.75079 17.2619 2.83873C18.1757 2.92561 18.7571 3.09223 19.2206 3.37628L20.0044 2.09732C19.2655 1.64457 18.4274 1.44279 17.4039 1.34547C16.3915 1.24921 15.1222 1.25 13.5 1.25V2.75ZM22.75 10.5C22.75 8.87781 22.7508 7.6085 22.6545 6.59611C22.5572 5.57256 22.3554 4.73445 21.9027 3.99563L20.6237 4.77938C20.9078 5.24291 21.0744 5.82434 21.1613 6.73809C21.2492 7.663 21.25 8.84876 21.25 10.5H22.75ZM19.2206 3.37628C19.7925 3.72672 20.2733 4.20752 20.6237 4.77938L21.9027 3.99563C21.4286 3.22194 20.7781 2.57144 20.0044 2.09732L19.2206 3.37628ZM10.5 1.25C8.87781 1.25 7.6085 1.24921 6.59611 1.34547C5.57256 1.44279 4.73445 1.64457 3.99563 2.09732L4.77938 3.37628C5.24291 3.09223 5.82434 2.92561 6.73809 2.83873C7.663 2.75079 8.84876 2.75 10.5 2.75V1.25ZM2.75 10.5C2.75 8.84876 2.75079 7.663 2.83873 6.73809C2.92561 5.82434 3.09223 5.24291 3.37628 4.77938L2.09732 3.99563C1.64457 4.73445 1.44279 5.57256 1.34547 6.59611C1.24921 7.6085 1.25 8.87781 1.25 10.5H2.75ZM3.99563 2.09732C3.22194 2.57144 2.57144 3.22194 2.09732 3.99563L3.37628 4.77938C3.72672 4.20752 4.20752 3.72672 4.77938 3.37628L3.99563 2.09732ZM11.0166 20.0898C10.8136 19.7468 10.6354 19.4441 10.4621 19.2063C10.2795 18.9559 10.0702 18.7304 9.77986 18.5615L9.02572 19.8582C9.07313 19.8857 9.13772 19.936 9.24985 20.0898C9.37122 20.2564 9.50835 20.4865 9.72579 20.8539L11.0166 20.0898ZM7.77666 19.7413C8.21575 19.7489 8.49387 19.7545 8.70588 19.7779C8.90399 19.7999 8.98078 19.832 9.02572 19.8582L9.77986 18.5615C9.4871 18.3912 9.18246 18.3215 8.87097 18.287C8.57339 18.2541 8.21375 18.2487 7.8025 18.2416L7.77666 19.7413ZM14.2742 20.8539C14.4916 20.4865 14.6287 20.2564 14.7501 20.0898C14.8622 19.936 14.9268 19.8857 14.9742 19.8582L14.2201 18.5615C13.9298 18.7304 13.7204 18.9559 13.5379 19.2063C13.3646 19.4441 13.1864 19.7468 12.9833 20.0898L14.2742 20.8539ZM16.1975 18.2416C15.7862 18.2487 15.4266 18.2541 15.129 18.287C14.8175 18.3215 14.5129 18.3912 14.2201 18.5615L14.9742 19.8582C15.0192 19.832 15.096 19.7999 15.2941 19.7779C15.5061 19.7545 15.7842 19.7489 16.2233 19.7413L16.1975 18.2416Z" fill="white"/>
                        <path d="M15.5 7.83008L15.6716 8.00165C17.0049 9.33498 17.6716 10.0017 17.6716 10.8301C17.6716 11.6585 17.0049 12.3252 15.6716 13.6585L15.5 13.8301" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M13.2939 6L11.9998 10.8296L10.7058 15.6593" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M8.49994 7.83008L8.32837 8.00165C6.99504 9.33498 6.32837 10.0017 6.32837 10.8301C6.32837 11.6585 6.99504 12.3252 8.32837 13.6585L8.49994 13.8301" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    }
                      
                    </div>
                  </div>
                )}
                
              </div>
              <div className={`rounded-lg p-3 text-right ${msg.type === 'received' 
                ? 'bg-pink-500 text-white rounded-bl-lg rounded-tl-lg rounded-tr-lg' 
                : 'bg-white text-gray-800 rounded-br-lg rounded-tr-lg rounded-tl-lg shadow'}`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.text}
                </ReactMarkdown>
                <div className="text-xs text-right mt-1 opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
            
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="ml-2">
              <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center text-white font-bold">
              <svg 
                      width="30"
                      height="30"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M14.1254 13H10.1254V15H14.1254V13Z" className="fill-white" />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M8.12537 13C9.22994 13 10.1254 12.1046 10.1254 11C10.1254 9.89543 9.22994 9 8.12537 9C7.0208 9 6.12537 9.89543 6.12537 11C6.12537 12.1046 7.0208 13 8.12537 13ZM8.12537 11.5C8.40151 11.5 8.62537 11.2761 8.62537 11C8.62537 10.7239 8.40151 10.5 8.12537 10.5C7.84922 10.5 7.62537 10.7239 7.62537 11C7.62537 11.2761 7.84922 11.5 8.12537 11.5Z"
                        className="fill-white"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M18.1254 11C18.1254 12.1046 17.2299 13 16.1254 13C15.0208 13 14.1254 12.1046 14.1254 11C14.1254 9.89543 15.0208 9 16.1254 9C17.2299 9 18.1254 9.89543 18.1254 11ZM16.6254 11C16.6254 11.2761 16.4015 11.5 16.1254 11.5C15.8492 11.5 15.6254 11.2761 15.6254 11C15.6254 10.7239 15.8492 10.5 16.1254 10.5C16.4015 10.5 16.6254 10.7239 16.6254 11Z"
                        className="fill-white"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M2.74884 14.6663C3.73056 16.6421 5.76939 18 8.12537 18H16.1254C18.5654 18 20.6652 16.5435 21.6029 14.4525C22.3722 13.9093 22.8746 13.0133 22.8746 12C22.8746 10.9867 22.3722 10.0907 21.6029 9.54753C20.6652 7.45651 18.5654 6 16.1254 6H8.12537C5.76939 6 3.73056 7.3579 2.74884 9.33375C1.78448 9.83263 1.12537 10.8393 1.12537 12C1.12537 13.1607 1.78448 14.1674 2.74884 14.6663ZM8.12537 8H16.1254C17.5088 8 18.7282 8.70234 19.4465 9.76991C19.7227 10.4593 19.8746 11.2119 19.8746 12C19.8746 12.7881 19.7227 13.5407 19.4465 14.2301C18.7282 15.2977 17.5088 16 16.1254 16H8.12537C5.91623 16 4.12537 14.2091 4.12537 12C4.12537 9.79086 5.91623 8 8.12537 8Z"
                        className="fill-white"
                      />
                    </svg> 
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow flex items-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce mr-1" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce mr-1" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Response Options */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto quick-scrollbar">
        <style jsx="true">{`
          .quick-scrollbar::-webkit-scrollbar {
            height: 4px;
          }
          .quick-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .quick-scrollbar::-webkit-scrollbar-thumb {
            background: #dfdfdf;
            border-radius: 10px;
          }
          .quick-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #dfdfdf;
          }
          .quick-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #dfdfdf transparent;
          }
        `}</style>
        <button 
          className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm whitespace-nowrap"
          onClick={() => handlePredefinedQuestion('آیا نمره بدتر توی ترمیم لحاظ میشه؟')}
        >
          آیا نمره بدتر توی ترمیم لحاظ میشه؟
        </button>
        <button 
          className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm whitespace-nowrap"
          onClick={() => handlePredefinedQuestion('سوابق تحصیلی در سال ۱۴۰۴ چطور اثر می‌گذاره؟')}
        >
          سوابق تحصیلی در سال ۱۴۰۴ چطور اثر می‌گذاره؟
        </button>
        <button 
          className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm whitespace-nowrap"
          onClick={() => handlePredefinedQuestion('غیبت در آزمون ایجاد سابقه چه تأثیری داره؟')}
        >
          غیبت در آزمون ایجاد سابقه چه تأثیری داره؟
        </button>
        <button 
          className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm whitespace-nowrap"
          onClick={() => handlePredefinedQuestion('اگر دو تا دیپلم داشته باشم، نمره کل چطور حساب میشه؟')}
        >
          اگر دو تا دیپلم داشته باشم، نمره کل چطور حساب میشه؟
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={sendMessage} className="flex border-t border-gray-200 p-3 gap-2 items-center bg-white">
        {/** <button type="button" className="text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
          </svg>
        </button>
        
        <button type="button" className="text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
          </svg>
        </button> */}
        
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اینجا تایپ کنید ..."
          className="flex-1 py-2 focus:outline-none text-right"
        />
        
        <button 
          type="submit" 
          disabled={isLoading}
          className={`text-gray-400 ${input.trim() ? 'text-pink-600' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 transform rotate-180">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </form>
    </div>
  );
}

export default Chat;