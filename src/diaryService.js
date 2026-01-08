import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, orderBy, deleteDoc, doc } from "firebase/firestore";

// 일기 삭제하기
export const deleteDiary = async (diaryId) => {
  try {
    await deleteDoc(doc(db, "diaries", diaryId));
    console.log("Document deleted with ID: ", diaryId);
    return true;
  } catch (e) {
    console.error("Error deleting document: ", e);
    return false;
  }
};

// 일기 저장하기
export const saveDiary = async (userId, date, emotion, content, type, visibility = 'private') => {
  try {
    const docRef = await addDoc(collection(db, "diaries"), {
      userId: userId,
      date: date, 
      emotion: emotion,
      content: content, 
      type: type, 
      visibility: visibility, // 'private' or 'public' (친구 공개)
      createdAt: new Date()
    });
    console.log("Document written with ID: ", docRef.id);
    return true;
  } catch (e) {
    console.error("Error adding document: ", e);
    return false;
  }
};

// 특정 사용자의 모든 일기 날짜 가져오기 (사이드바용)
export const getDiaryDates = async (userId) => {
  const q = query(
    collection(db, "diaries"), 
    where("userId", "==", userId),
    orderBy("date", "desc")
  );

  const querySnapshot = await getDocs(q);
  const uniqueDates = new Set();
  const result = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (!uniqueDates.has(data.date)) {
      uniqueDates.add(data.date);
      // id는 해당 날짜의 아무 문서 id나 사용 (링크용)
      result.push({ id: doc.id, date: data.date });
    }
  });
  return result;
};

// 특정 날짜의 일기 가져오기
export const getDiariesByDate = async (userId, date) => {
  const q = query(
    collection(db, "diaries"),
    where("userId", "==", userId),
    where("date", "==", date)
  );

  const querySnapshot = await getDocs(q);
  const diaries = [];
  querySnapshot.forEach((doc) => {
    diaries.push({ id: doc.id, ...doc.data() });
  });
  return diaries;
};
