import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './index.css';
import { getDiaryDates } from './diaryService';

const Sidebar = ({ user }) => {
  const [diaryEntries, setDiaryEntries] = useState([]);

  useEffect(() => {
    if (user) {
      // 로그인한 경우 일기 목록 가져오기
      const fetchDates = async () => {
        const dates = await getDiaryDates(user.uid);
        setDiaryEntries(dates);
      };
      fetchDates();
    } else {
      setDiaryEntries([]);
    }
  }, [user]);

  return (
    <div className="sidebar" style={{ fontFamily: 'Ownglyph_ryuttung-Rg' }}>
      <h3>지난 일기</h3>
      {user ? (
        <ul>
          {diaryEntries.map((entry) => (
            <li key={entry.id}>
              {/* 날짜를 클릭하면 그 날짜로 이동하는 로직은 나중에 구현 (현재는 링크만) */}
              <Link to={`/diary/${entry.date}`}>{entry.date}</Link>
            </li>
          ))}
          {diaryEntries.length === 0 && <p style={{fontSize: '14px'}}>작성된 일기가 없습니다.</p>}
        </ul>
      ) : (
        <p style={{fontSize: '16px'}}>로그인이 필요합니다.</p>
      )}
    </div>
  );
};

export default Sidebar;
