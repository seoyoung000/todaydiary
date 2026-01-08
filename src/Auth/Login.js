import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"; 

const Login = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      alert("구글 계정으로 로그인되었습니다!");
      navigate('/'); // 메인 화면으로 이동
    } catch (error) {
      console.error("구글 로그인 에러:", error);
      let errorMessage = "구글 로그인에 실패했습니다.";
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "구글 로그인 팝업이 닫혔습니다.";
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = "이미 진행 중인 구글 로그인 요청이 있습니다.";
      }
      alert(errorMessage);
    }
  };

  return (
    <div className="auth-container" style={{ fontFamily: 'Ownglyph_ryuttung-Rg' }}>
      <h2>로그인</h2>
      <p style={{ marginBottom: '20px', fontSize: '20px' }}>오늘의 일기를 쓰려면 구글 계정으로 로그인해주세요.</p>
      
      <button onClick={handleGoogleLogin} className="google-login-button" style={{ 
        padding: '15px 30px', 
        fontSize: '16px', 
        backgroundColor: '#4285F4', 
        color: 'white', 
        border: 'none', 
        borderRadius: '5px',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}>
        Google로 로그인
      </button>
    </div>
  );
};

export default Login;
