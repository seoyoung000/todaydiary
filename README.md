# 동양미래대학교 React 과제


<img width="2040" height="1109" alt="image" src="https://github.com/user-attachments/assets/e3a5e6d1-a33d-4017-8814-8042839a26b1" />

## ✨ 주요 기능
- **일기 작성 및 관리**: 오늘의 감정과 일상을 글 및 그림으로 기록하고 저장합니다.
- **친구와 일기 공유**: 작성한 일기를 친구들과 공유하고 함께 읽을 수 있습니다.
- **마이페이지**: 개인 설정 친구 목록을 확인할 수 있습니다.
- **Firebase 연동**: 데이터베이스를 통해 계정과 기록을 저장합니다.

## 🛠 기술 스택
- **Frontend**: React.js
- **Backend/Database**: Firebase (Authentication, Firestore)
- **Styling**: CSS (App.css, index.css)

## 🚀 시작하기
1. 프로젝트 클론
   ```bash
   git clone https://github.com/seoyoung000/todaydiary.git
   ```
2. 패키지를 설치
   ```bash
   npm install
   ```
3. 어플리케이션 실행
   ```bash
   npm start
   ```

## 📂 프로젝트 구조
- `src/Auth`: 사용자 인증 관련 컴포넌트
- `src/Diary`: 일기 작성 및 리스트 컴포넌트
- `src/firebase.js`: Firebase 설정 및 초기화
- `src/Sidebar.js`: 네비게이션 사이드바
- `src/FriendsDiaries.js`: 친구 일기 공유 기능
