import React, { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';
import '../index.css'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { saveDiary } from '../diaryService';

const DrawingDiary = ({ handleSetValue, user, date, emotion, visibility }) => {
  const canvasRef = useRef(null);
  
  console.log("DrawingDiary rendered. User:", user); // 디버깅용 로그

  const [isDrawing, setIsDrawing] = useState(true);
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('black');
  const [canvas, setCanvas] = useState(null);
  const [isSaved, setIsSaved] = useState(false); // 저장 완료 상태 추가
  

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      selection: false,
    });
    // 캔버스 래퍼에 테두리 스타일 적용
    if (canvas.wrapperEl) {
      canvas.wrapperEl.style.border = "1px solid black";
    }
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.width = brushSize;
    canvas.freeDrawingBrush.color = brushColor;
    canvas.selectionColor = 'rgba(0,0,255,0.3)';
    canvas.selectionBorderColor = 'blue';
    canvas.selectionLineWidth = 2;

    setCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);


  const handleSaveDrawing = async () => {
    console.log("Save Drawing button clicked!"); // 클릭 확인용 로그

    if (!user) {
      alert("로그인이 필요합니다. 로그인 후 다시 시도해주세요.");
      return;
    }
    if (canvas.getObjects().length === 0) {
      toast.error('그림을 그려주세요.', {
        position: "bottom-right",
        autoClose: 2000,
      });
      return;
    } 

    const dataURL = canvas.toDataURL();
    handleSetValue(dataURL);
    
    // DB 저장 (visibility 추가)
    const dateString = date.toISOString().split('T')[0];
    const success = await saveDiary(user.uid, dateString, emotion, dataURL, 'drawing', visibility);

    if (success) {
      setIsSaved(true);
      toast.success('그림 일기가 저장되었습니다!', {
        position: "bottom-right",
        autoClose: 1000,
      });
      setTimeout(() => {
        setIsSaved(false);
      }, 1000);
    } else {
       toast.error('저장에 실패했습니다.', {
        position: "bottom-right",
        autoClose: 1000,
      });
    }
  }; // 토스트창

  const handleToggleDrawing = () => {
    setIsDrawing((prevState) => !prevState);
  };

  const handleBrushSizeChange = (e) => {
    const newBrushSize = Number(e.target.value);
    setBrushSize(newBrushSize);
    canvas.freeDrawingBrush.width = newBrushSize;
  };

  const handleBrushColorChange = (e) => {
    const newBrushColor = e.target.value;
    setBrushColor(newBrushColor);
    canvas.freeDrawingBrush.color = newBrushColor;
  };

  const handleClear = () => {
    canvas.clear();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <canvas ref={canvasRef} width={800} height={600} />
      <div style={{ marginTop: '10px' }}>
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={handleBrushSizeChange}
        />
        <input
          type="color"
          value={brushColor}
          onChange={handleBrushColorChange}
        />
        <button onClick={handleClear} style={{ cursor: 'pointer', zIndex: 100, position: 'relative', marginRight: '10px' }}>지우기</button>
        <button onClick={handleSaveDrawing} style={{ cursor: 'pointer', zIndex: 100, position: 'relative' }}>저장하기</button>
      </div>
      <ToastContainer />
    </div>
  );
};

export { DrawingDiary } ;
