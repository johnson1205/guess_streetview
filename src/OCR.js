import React, { useState, useRef, useEffect } from 'react';
import Tesseract from 'tesseract.js';

const OCR = ({ onBackToHome }) => {
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (image) {
      recognizeText(image);
    }
  }, [image]);

  const recognizeText = (image) => {
    setLoading(true);
    Tesseract.recognize(image, ['chi_tra'], {
      logger: (m) => console.log(m),
    })
      .then(({ data }) => {
        setText(data.text);

        const words = data.words.map((word) => {
          const { text, bbox } = word;
          return `${text}: (${bbox.x0}, ${bbox.y0}) - (${bbox.x1}, ${bbox.y1})`;
        });

        setCoordinates(words.join('\n'));
        processImage(data.words);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const processImage = (words) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      // Draw the original image
      ctx.drawImage(img, 0, 0, img.width, img.height);

      // Process each word
      words.forEach((word) => {
        const { text, bbox } = word;
        
        // Fill text area with white
        ctx.fillStyle = 'white';
        ctx.fillRect(bbox.x0, bbox.y0, bbox.x1 - bbox.x0, bbox.y1 - bbox.y0);
        
        // Write the text
        ctx.fillStyle = 'black';
        ctx.font = `${bbox.y1 - bbox.y0}px Arial`; // Set font size to fit the height
        ctx.textBaseline = 'top';
        ctx.textAlign = 'center';
        
        // Calculate the center of the bounding box
        const centerX = (bbox.x0 + bbox.x1) / 2;
        const centerY = bbox.y0;
        
        // Draw the text
        ctx.fillText(text, centerX, centerY);
      });

      // Set the processed image
      setProcessedImage(canvas.toDataURL());
    };
    img.src = image;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 p-4">
      <h1 className="text-4xl font-bold mb-8">OCR Page</h1>
      <p className="mb-4">This is the OCR page of the application.</p>

      <input type="file" onChange={handleImageUpload} accept="image/*" className="mb-4" />

      {image && (
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold mb-2">Original Image</h2>
            <img src={image} alt="Original" className="max-w-xs" />
          </div>
          {processedImage && (
            <div>
              <h2 className="text-xl font-bold mb-2">Processed Image</h2>
              <img src={processedImage} alt="Processed" className="max-w-xs" />
            </div>
          )}
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {loading ? (
        <p>Processing...</p>
      ) : (
        <div className="flex flex-col w-full max-w-2xl">
          <textarea
            className="w-full p-2 border border-gray-400 rounded mb-4"
            rows="5"
            value={text}
            readOnly
          />
          <textarea
            className="w-full p-2 border border-gray-400 rounded"
            rows="10"
            value={coordinates}
            readOnly
          />
        </div>
      )}

      <button
        onClick={onBackToHome}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
      >
        Back to Home
      </button>
    </div>
  );
};

export default OCR;