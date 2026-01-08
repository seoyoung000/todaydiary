import React from 'react'; // useState 제거 (props로 받으므로)
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { saveDiary } from '../diaryService'; // 저장 함수 import

function TextDiary({ textValue, handleTextChange, user, date, emotion, visibility }) { // props 구조 분해 할당

  console.log("TextDiary rendered. User:", user); // 디버깅용 로그

  const handleSaveText = async () => {
    console.log("Save button clicked!"); // 클릭 확인용 로그

    if (!user) {
      alert("로그인이 필요합니다. 로그인 후 다시 시도해주세요.");
      return;
    }
    if (!textValue) {
      toast.error('내용을 입력해주세요.', {
        position: 'bottom-right',
        autoClose: 1000,
      });
      return;
    }

    // 날짜 포맷팅 (YYYY-MM-DD)
    const dateString = date.toISOString().split('T')[0];

    // DB 저장 (visibility 추가)
    const success = await saveDiary(user.uid, dateString, emotion, textValue, 'text', visibility);

    if (success) {
      toast.success('일기가 저장되었습니다!', {
        position: 'bottom-right',
        autoClose: 1000,
      });
    } else {
      toast.error('저장에 실패했습니다.', {
        position: 'bottom-right',
        autoClose: 1000,
      });
    }
  };

  return (
    <div className='text'>
      <textarea
        placeholder="오늘 하루는 어땠나요?"
        value={textValue}
        onChange={handleTextChange}
      ></textarea>
      <button 
        name='save' 
        onClick={handleSaveText}
        style={{ cursor: 'pointer', zIndex: 100, position: 'relative' }}
      >
        저장하기
      </button>
      <ToastContainer />
    </div>
  );
}

export { TextDiary };
