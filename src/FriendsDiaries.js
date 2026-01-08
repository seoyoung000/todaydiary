import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, query, where, orderBy, getDocs, doc, getDoc } from "firebase/firestore";
import { Link, useNavigate } from 'react-router-dom';
import './index.css';

const FriendsDiaries = ({ user }) => {
  const [friendsDiaries, setFriendsDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      alert("로그인이 필요합니다.");
      navigate('/login');
      return;
    }

    const fetchFriendsDiaries = async () => {
      setLoading(true);
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) {
          setFriendsDiaries([]);
          setLoading(false);
          return;
        }

        const friendUids = userDoc.data().friends || [];

        if (friendUids.length === 0) {
          setFriendsDiaries([]);
          setLoading(false);
          return;
        }

        // 친구들의 '친구 공개' 일기 가져오기
        const q = query(
          collection(db, "diaries"),
          where("userId", "in", friendUids), // 내 친구들의 일기만
          where("visibility", "==", "public"), // '친구 공개' 일기만
          orderBy("createdAt", "desc") // 최신순 정렬
        );

        const querySnapshot = await getDocs(q);
        const diariesData = [];
        for (const diaryDoc of querySnapshot.docs) {
          const diary = { id: diaryDoc.id, ...diaryDoc.data() };
          // 친구 닉네임 가져오기 (각 일기의 userId로 친구 닉네임을 찾음)
          const friendInfoDoc = await getDoc(doc(db, "users", diary.userId));
          if (friendInfoDoc.exists()) {
            diary.friendNickname = friendInfoDoc.data().nickname || diary.userId;
          } else {
            diary.friendNickname = diary.userId;
          }
          diariesData.push(diary);
        }
        setFriendsDiaries(diariesData);

      } catch (error) {
        console.error("친구 일기 불러오기 실패:", error);
        alert("친구 일기를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchFriendsDiaries();
  }, [user, navigate]);

  if (!user) return <div style={{ padding: '20px', fontFamily: 'Ownglyph_ryuttung-Rg' }}>로그인이 필요합니다.</div>;
  if (loading) return <div style={{ padding: '20px', fontFamily: 'Ownglyph_ryuttung-Rg' }}>친구 일기를 불러오는 중...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Ownglyph_ryuttung-Rg', maxWidth: '800px', margin: '0 auto' }}>
      <h2>친구들의 일기</h2>
      
      {friendsDiaries.length === 0 ? (
        <p>친구들이 작성한 '친구 공개' 일기가 없습니다. 친구를 추가하거나 친구들에게 일기를 써달라고 요청해보세요!</p>
      ) : (
        friendsDiaries.map((diary) => (
          <div key={diary.id} style={{ 
            border: '1px solid #ddd', 
            borderRadius: '10px', 
            padding: '20px', 
            marginBottom: '20px', 
            textAlign: 'left',
            backgroundColor: '#fff'
          }}>
            <p style={{ fontSize: '14px', color: '#888', marginBottom: '5px' }}>
              작성자: {diary.friendNickname} / 날짜: {diary.date}
              {diary.createdAt && ` / ${new Date(diary.createdAt.toDate()).toLocaleString()}`}
            </p>
            <div style={{ marginBottom: '10px', fontSize: '18px', fontWeight: 'bold' }}>
              감정: <span style={{ color: 'blue' }}>{diary.emotion}</span>
            </div>
            
            {diary.type === 'text' ? (
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '16px' }}>
                {diary.content}
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <img 
                  src={diary.content} 
                  alt="친구 그림 일기" 
                  style={{ maxWidth: '100%', border: '1px solid #eee', borderRadius: '5px' }} 
                />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default FriendsDiaries;