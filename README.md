# TodayDiary (오늘의 일기) 📔

React와 Firebase를 활용한 개인 및 공유 일기장 서비스입니다.

## ✨ 주요 기능
- **일기 작성 및 관리**: 오늘의 감정과 일상을 기록하고 저장합니다.
- **Firebase 연동**: 실시간 데이터베이스를 통한 데이터 저장 및 인증 시스템 구축.
- **친구와 일기 공유**: 작성한 일기를 친구들과 공유하고 함께 읽을 수 있습니다.
- **마이페이지**: 개인 설정 및 본인의 활동을 확인할 수 있습니다.

## 🛠 기술 스택
- **Frontend**: React.js
- **Backend/Database**: Firebase (Authentication, Firestore)
- **Styling**: CSS (App.css, index.css)

## 🚀 시작하기
1. 저장소를 클론합니다.
   ```bash
   git clone https://github.com/seoyoung000/todaydiary.git
   ```
2. 필요한 패키지를 설치합니다.
   ```bash
   npm install
   ```
3. 어플리케이션을 실행합니다.
   ```bash
   npm start
   ```

## 📂 프로젝트 구조
- `src/Auth`: 사용자 인증 관련 컴포넌트
- `src/Diary`: 일기 작성 및 리스트 컴포넌트
- `src/firebase.js`: Firebase 설정 및 초기화
- `src/Sidebar.js`: 네비게이션 사이드바
- `src/FriendsDiaries.js`: 친구 일기 공유 기능