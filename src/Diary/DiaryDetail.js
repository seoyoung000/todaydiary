import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDiariesByDate, deleteDiary } from '../diaryService';
import '../index.css';
import html2canvas from 'html2canvas'; // 캡쳐 라이브러리 import

const DiaryDetail = ({ user }) => {
  const { date } = useParams(); // URL에서 날짜 가져오기 (예: 2026-01-08)
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // ... (기존 useEffect 내용 유지)
    if (!user) {
      alert("로그인이 필요합니다.");
      navigate('/login');
      return;
    }

    const fetchDiaries = async () => {
      try {
        const data = await getDiariesByDate(user.uid, date);
        setDiaries(data);
      } catch (error) {
        console.error("일기 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiaries();
  }, [user, date, navigate]);

  const handleDelete = async (diaryId) => {
    if (window.confirm("정말로 이 일기를 삭제하시겠습니까?")) {
      const success = await deleteDiary(diaryId);
      if (success) {
        alert("일기가 삭제되었습니다.");
        setDiaries(diaries.filter(diary => diary.id !== diaryId));
        if (diaries.length === 1) {
           navigate('/reactproject/');
        }
      } else {
        alert("삭제에 실패했습니다.");
      }
    }
  };

  const handleDownload = async (diaryId) => {
    const element = document.getElementById(`diary-card-${diaryId}`);
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2, // 고화질 캡쳐
        backgroundColor: '#ffffff' // 배경 흰색 지정
      });
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `diary-${date}-${diaryId}.png`;
      link.click();
    } catch (err) {
      console.error("캡쳐 실패:", err);
      alert("이미지 저장 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '20px', fontFamily: 'Ownglyph_ryuttung-Rg' }}>일기를 불러오는 중...</div>;

  return (
    <div className="daily" style={{ padding: '20px', fontFamily: 'Ownglyph_ryuttung-Rg' }}>
      <h2>일기 기록 ({date})</h2>
      
      {diaries.length === 0 ? (
        <p>이 날짜에 작성된 일기가 없습니다.</p>
      ) : (
        diaries.map((diary) => (
          <div 
            key={diary.id} 
            id={`diary-card-${diary.id}`} // 캡쳐를 위한 ID 지정
            style={{ 
              border: '1px solid #ddd', 
              borderRadius: '10px', 
              padding: '20px', 
              marginBottom: '20px', 
              textAlign: 'left',
              backgroundColor: '#fff',
              position: 'relative' 
            }}
          >
            {/* 버튼 그룹 (캡쳐 시 무시됨) */}
            <div 
              data-html2canvas-ignore="true"
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                display: 'flex',
                gap: '5px'
              }}
            >
              <button 
                onClick={() => handleDownload(diary.id)}
                style={{
                  backgroundColor: '#4285F4', // 파란색
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  padding: '5px 10px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontFamily: 'Ownglyph_ryuttung-Rg'
                }}
              >
                저장
              </button>
              <button 
                onClick={() => handleDelete(diary.id)}
                style={{
                  backgroundColor: '#ff4444', // 빨간색
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  padding: '5px 10px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontFamily: 'Ownglyph_ryuttung-Rg'
                }}
              >
                삭제
              </button>
            </div>

            <div style={{ marginBottom: '10px', fontSize: '18px', fontWeight: 'bold' }}>
              감정: <span style={{ color: 'blue' }}>{diary.emotion}</span>
            </div>
            
            {diary.type === 'text' ? (
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '16px', fontFamily: 'Ownglyph_ryuttung-Rg' }}>
                {diary.content}
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <img 
                  src={diary.content} 
                  alt="그림 일기" 
                  style={{ maxWidth: '100%', border: '1px solid #eee', borderRadius: '5px' }} 
                />
              </div>
            )}
            <div style={{ fontSize: '12px', color: '#888', marginTop: '10px', textAlign: 'right' }}>
              {/* 작성 시간 표시 (옵션) */}
              작성: {diary.createdAt?.toDate().toLocaleTimeString()}
            </div>
          </div>
        ))
      )}
      
      <button onClick={() => navigate(-1)} style={{ marginTop: '20px' }}>뒤로 가기</button>
    </div>
  );
};

export default DiaryDetail;
