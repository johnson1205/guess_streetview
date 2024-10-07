import React, { useState } from 'react';
import App from './App';
import OCR from './OCR';
import Hard from './hard';
import Extreme from './extreme';

const HomePage = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'normal':
        return <App onBackToHome={() => setCurrentPage('home')} />;
      case 'hard':
        return <Hard onBackToHome={() => setCurrentPage('home')} />;
      case 'extreme':
          return <Extreme onBackToHome={() => setCurrentPage('home')} />;
      case 'OCR':
        return <OCR onBackToHome={() => setCurrentPage('home')} />;
      
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-8">Welcome to guess_streetview</h1>
            <div className="space-x-4">
              <button 
                onClick={() => setCurrentPage('normal')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
              >
                Normal Mode
              </button>
              <button 
                onClick={() => setCurrentPage('hard')}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
              >
                Hard Mode
              </button>
              <button 
                onClick={() => setCurrentPage('extreme')}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
              >
                Extreme Mode
              </button>
              <button 
                onClick={() => setCurrentPage('OCR')}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
              >
                OCR
              </button>
            </div>
          </div>
        );
    }
  };

  return renderPage();
};

export default HomePage;