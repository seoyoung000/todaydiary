import './App.css';
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

// Firebase import (한 번만 선언)
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// 컴포넌트 import
import { DrawingDiary } from './Diary/DrawingDiary';
import { TextDiary } from './Diary/TextDiary';
import Login from './Auth/Login';
import Sidebar from './Sidebar';
import DiaryDetail from './Diary/DiaryDetail';
import MyPage from './MyPage';
import FriendsDiaries from './FriendsDiaries';

// Radio 컴포넌트들
function RadioGroup({ name, selectedValue, onChange, children }) {
  return (
    <>
      {React.Children.map(children, child =>
        React.isValidElement(child) && (
          <Radio
            key={child.props.value}
            {...child.props}
            name={name}
            checked={child.props.value === selectedValue}
            onChange={onChange}
          />
        )
      )}
    </>
  );
}

function Radio({ name, value, checked, onChange, children }) {
  return (
    <label style={{ margin: '0 5px', fontFamily: 'Ownglyph_ryuttung-Rg', fontSize: '18px' }}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        style={{ marginRight: '5px' }}
      />
      {children || value}
    </label>
  );
}

// AppContent 컴포넌트
function AppContent() {
  const [selectedValue, setSelectedValue] = useState('');
  const [textValue, setTextValue] = useState('');
  const [drawingValue, setDrawingValue] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date()); 
  const [visibility, setVisibility] = useState('private'); 
  const [user, setUser] = useState(null); 
  
  const location = useLocation();
  // 로그인, 상세 페이지, 마이페이지, 친구 일기 페이지에서는 컨트롤 숨김
  const shouldHideControls = location.pathname === '/login' || location.pathname.startsWith('/diary/') || location.pathname === '/mypage' || location.pathname === '/friends-diaries';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Current User:", currentUser);
      setUser(currentUser);
      
      if (currentUser) {
        try {
          await setDoc(doc(db, "users", currentUser.uid), {
            email: currentUser.email,
            uid: currentUser.uid,
            lastLogin: serverTimestamp(),
          }, { merge: true });
        } catch (e) {
          console.error("Error saving user info:", e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("로그아웃 되었습니다.");
    } catch (error) {
      console.error("로그아웃 에러:", error);
    }
  };

  const handleRadioChange = (e) => {
    setSelectedValue(e.target.value);
  };

  const handleVisibilityChange = (e) => {
    setVisibility(e.target.value);
  };

  const handleTextChange = (e) => {
    setTextValue(e.target.value);
  };

  const handleSetValue = (value) => { 
    setDrawingValue(value);
  };

  const handleDateChange = (e) => { 
    setSelectedDate(new Date(e.target.value));
  };

  return (
    <div className="App">
      <div className="top-bar">
        <Link to="/" style={{ textDecoration: 'none', color: 'black' }}>
          <h2>일기장</h2>
        </Link>
        <div className="auth-buttons">
          {user ? (
            <>
              <Link to="/friends-diaries"><button style={{ marginRight: '10px' }}>친구 일기</button></Link>
              <Link to="/mypage"><button style={{ marginRight: '10px' }}>마이페이지</button></Link>
              <span style={{ marginRight: '10px', fontFamily: 'Ownglyph_ryuttung-Rg' }}>환영합니다, {user.email}님!</span>
              <button onClick={handleLogout}>로그아웃</button>
            </>
          ) : (
            <Link to="/login"><button>로그인</button></Link>
          )}
        </div>
      </div>

      <div className="content-container">
        <Sidebar user={user} />

        <div className="main-view">
          {!shouldHideControls && (
            <>
              <div className='daily'>
                <input type="date" value={selectedDate.toISOString().slice(0, 10)} onChange={handleDateChange} />
              </div>
              <div className='emotion'>
                <RadioGroup name="emotion" selectedValue={selectedValue} onChange={handleRadioChange}>
                  <Radio value="매우좋음">매우 좋음</Radio>
                  <Radio value="좋음">좋음</Radio>
                  <Radio value="보통">보통</Radio>
                  <Radio value="나쁨">나쁨</Radio>
                  <Radio value="매우나쁨">매우 나쁨</Radio>
                </RadioGroup>
              </div>

              <div className='visibility' style={{ margin: '10px 0', fontFamily: 'Ownglyph_ryuttung-Rg' }}>
                <span style={{ marginRight: '10px' }}>공개 설정: </span>
                <RadioGroup name="visibility" selectedValue={visibility} onChange={handleVisibilityChange}>
                  <Radio value="private">나만 보기</Radio>
                  <Radio value="public">친구 공개</Radio>
                </RadioGroup>
              </div>

              <div className='diary-type-buttons' style={{ marginBottom: '20px' }}>
                <Link to="/text-diary"><button>글 일기</button></Link>
                <Link to="/drawing-diary"><button>그림 일기</button></Link>
              </div>
            </>
          )}

          <Routes>
            <Route path="/" element={
              !shouldHideControls ? (
                <p style={{fontFamily: 'Ownglyph_ryuttung-Rg', fontSize: '20px'}}>
                  일기 유형을 선택하거나 왼쪽에서 지난 일기를 확인하세요.
                </p>
              ) : null
            } />
            <Route path="/text-diary" element={
              <TextDiary 
                textValue={textValue} 
                handleTextChange={handleTextChange} 
                user={user}
                date={selectedDate}
                emotion={selectedValue}
                visibility={visibility}
              />
            } />
            <Route path="/drawing-diary" element={
              <DrawingDiary 
                handleSetValue={handleSetValue}
                user={user}
                date={selectedDate}
                emotion={selectedValue}
                visibility={visibility}
              />
            } />
            
            <Route path="/diary/:date" element={<DiaryDetail user={user} />} />
            
            <Route path="/mypage" element={<MyPage user={user} />} />
            
            <Route path="/friends-diaries" element={<FriendsDiaries user={user} />} />

            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <AppContent />
    </Router>
  );
}

export default App;
