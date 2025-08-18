import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
 
const ScreenshotComponent = (Ref) => {
  const captureRef = useRef();
 
  const handleScreenshot = async () => {
    const element = captureRef.current;
    const canvas = await html2canvas(element);
    const dataURL = canvas.toDataURL('image/png');
 
    // Create a download link
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'screenshot.png';
    link.click();
  };
 
  return (
    <div>
      <div ref={captureRef} style={{ padding: 20, backgroundColor: '#f0f0f0' }}>
        <h2>This is the area to capture</h2>
        <p>You can include any content here.</p>
      </div>
      <button style={{color:"red"}}onClick={handleScreenshot}>Download</button>
    </div>
  );
};
 
export default ScreenshotComponent;
  
 