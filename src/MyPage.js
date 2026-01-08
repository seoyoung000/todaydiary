import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, onSnapshot, arrayUnion, arrayRemove, deleteDoc } from "firebase/firestore";
import './index.css';

const MyPage = ({ user }) => {
  const [nickname, setNickname] = useState('');
  const [currentNickname, setCurrentNickname] = useState('');
  const [friendCode, setFriendCode] = useState(''); 
  const [friendRequests, setFriendRequests] = useState([]); // 나에게 온 친구 요청
  const [friends, setFriends] = useState([]); // 내 친구 목록
  const [loading, setLoading] = useState(true);

  // 내 정보 불러오기 및 실시간 닉네임 변경 감지
  useEffect(() => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setCurrentNickname(docSnap.data().nickname || '');
        }
        setLoading(false);
      });
      return () => unsubscribe(); // 클린업 함수
    }
  }, [user]);

  // 친구 요청 실시간 감지
  useEffect(() => {
    if (user) {
      const q = query(collection(db, "friendRequests"), where("toUserId", "==", user.uid), where("status", "==", "pending"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFriendRequests(requests);
      });
      return () => unsubscribe();
    }
  }, [user]);

  // 친구 목록 실시간 감지
  useEffect(() => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const unsubscribe = onSnapshot(userRef, async (docSnap) => {
        if (docSnap.exists()) {
          const friendUids = docSnap.data().friends || [];
          // 친구 UID를 바탕으로 친구 정보(닉네임, 이메일) 가져오기
          if (friendUids.length > 0) {
            const friendPromises = friendUids.map(async (friendUid) => {
              const friendDoc = await getDoc(doc(db, "users", friendUid));
              if (friendDoc.exists()) {
                return { uid: friendDoc.id, ...friendDoc.data() };
              }
              return null;
            });
            const friendsData = (await Promise.all(friendPromises)).filter(Boolean);
            setFriends(friendsData);
          } else {
            setFriends([]);
          }
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  // 닉네임 변경 함수
  const handleUpdateNickname = async () => {
    if (!nickname) return alert("닉네임을 입력해주세요.");
    
    const q = query(collection(db, "users"), where("nickname", "==", nickname));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty && querySnapshot.docs[0].id !== user.uid) { // 나 자신의 닉네임이 아닌 경우에만 중복 검사
      return alert("이미 사용 중인 닉네임입니다.");
    }

    try {
      await updateDoc(doc(db, "users", user.uid), {
        nickname: nickname
      });
      // setCurrentNickname(nickname); // onSnapshot으로 자동 업데이트
      setNickname('');
      alert("닉네임이 설정되었습니다!");
    } catch (error) {
      console.error("닉네임 업데이트 실패:", error);
      alert("업데이트 중 오류가 발생했습니다.");
    }
  };

  // 친구 요청 보내기 함수
  const handleSendFriendRequest = async () => {
    if (!friendCode) return alert("친구의 닉네임을 입력해주세요.");
    if (friendCode === currentNickname) return alert("나 자신에게는 요청할 수 없습니다.");

    const q = query(collection(db, "users"), where("nickname", "==", friendCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return alert("해당 닉네임의 사용자를 찾을 수 없습니다.");
    }

    const targetUserDoc = querySnapshot.docs[0];
    const targetUserId = targetUserDoc.id;

    // 2. 이미 친구인지 확인 (생략 가능하지만 권장)
    if (friends.some(friend => friend.uid === targetUserId)) {
      return alert("이미 친구입니다.");
    }
    // 3. 이미 요청을 보냈는지 확인 (나 -> 상대방)
    const existingRequestQuery = query(
      collection(db, "friendRequests"),
      where("fromUserId", "==", user.uid),
      where("toUserId", "==", targetUserId),
      where("status", "==", "pending")
    );
    const existingRequestSnap = await getDocs(existingRequestQuery);
    if (!existingRequestSnap.empty) {
      return alert("이미 친구 요청을 보냈습니다.");
    }
    // 4. 상대방이 나에게 요청을 보냈는지 확인 (상대방 -> 나)
    const reciprocalRequestQuery = query(
      collection(db, "friendRequests"),
      where("fromUserId", "==", targetUserId),
      where("toUserId", "==", user.uid),
      where("status", "==", "pending")
    );
    const reciprocalRequestSnap = await getDocs(reciprocalRequestQuery);
    if (!reciprocalRequestSnap.empty) {
      return alert("상대방이 이미 친구 요청을 보냈습니다. 수락해주세요.");
    }


    try {
      await addDoc(collection(db, "friendRequests"), {
        fromUserId: user.uid,
        fromNickname: currentNickname, // 요청 보내는 사람 닉네임
        toUserId: targetUserId,
        toNickname: targetUserDoc.data().nickname, // 요청 받는 사람 닉네임
        status: 'pending',
        createdAt: new Date()
      });
      alert(`${friendCode}님에게 친구 요청을 보냈습니다!`);
      setFriendCode('');
    } catch (error) {
      console.error("친구 요청 실패:", error);
      alert("요청 전송 실패");
    }
  };

  // 친구 요청 수락
  const handleAcceptRequest = async (request) => {
    try {
      // 1. friendRequests 컬렉션에서 해당 요청 문서 삭제
      await deleteDoc(doc(db, "friendRequests", request.id));

      // 2. 나와 상대방의 users 문서에 서로의 UID를 friends 배열에 추가
      await updateDoc(doc(db, "users", user.uid), {
        friends: arrayUnion(request.fromUserId)
      });
      await updateDoc(doc(db, "users", request.fromUserId), {
        friends: arrayUnion(user.uid)
      });
      alert(`${request.fromNickname}님의 친구 요청을 수락했습니다!`);
    } catch (error) {
      console.error("친구 요청 수락 실패:", error);
      alert("요청 수락 실패");
    }
  };

  // 친구 요청 거절
  const handleRejectRequest = async (requestId) => {
    try {
      await deleteDoc(doc(db, "friendRequests", requestId));
      alert("친구 요청을 거절했습니다.");
    } catch (error) {
      console.error("친구 요청 거절 실패:", error);
      alert("요청 거절 실패");
    }
  };

  // 친구 삭제
  const handleRemoveFriend = async (friendUid, friendNickname) => {
    if (!window.confirm(`${friendNickname}님을 친구 목록에서 삭제하시겠습니까?`)) return;

    try {
      // 내 friends 배열에서 상대방 UID 제거
      await updateDoc(doc(db, "users", user.uid), {
        friends: arrayRemove(friendUid)
      });
      // 상대방 friends 배열에서 내 UID 제거
      await updateDoc(doc(db, "users", friendUid), {
        friends: arrayRemove(user.uid)
      });
      alert(`${friendNickname}님과의 친구 관계를 해제했습니다.`);
    } catch (error) {
      console.error("친구 삭제 실패:", error);
      alert("친구 삭제 실패");
    }
  };


  if (!user) return <div style={{ padding: '20px', fontFamily: 'Ownglyph_ryuttung-Rg' }}>로그인이 필요합니다.</div>;
  if (loading) return <div style={{ padding: '20px', fontFamily: 'Ownglyph_ryuttung-Rg' }}>로딩 중...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Ownglyph_ryuttung-Rg', maxWidth: '600px', margin: '0 auto' }}>
      <h2>마이페이지</h2>
      
      <div style={{ marginBottom: '30px', borderBottom: '1px solid #ddd', paddingBottom: '20px' }}>
        <h3>내 정보</h3>
        <p>이메일: {user.email}</p>
        <p>현재 닉네임 (친구코드): <strong>{currentNickname || '설정되지 않음'}</strong></p>
        
        <div style={{ marginTop: '10px' }}>
          <input 
            type="text" 
            placeholder="새 닉네임 입력" 
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            style={{ padding: '5px', marginRight: '5px', fontFamily: 'Ownglyph_ryuttung-Rg' }}
          />
          <button onClick={handleUpdateNickname} style={{ fontFamily: 'Ownglyph_ryuttung-Rg' }}>설정하기</button>
        </div>
      </div>

      <div style={{ marginBottom: '30px', borderBottom: '1px solid #ddd', paddingBottom: '20px' }}>
        <h3>친구 추가</h3>
        <p>친구의 닉네임을 입력하여 요청을 보내세요.</p>
        <input 
          type="text" 
          placeholder="친구 닉네임 입력" 
          value={friendCode}
          onChange={(e) => setFriendCode(e.target.value)}
          style={{ padding: '5px', marginRight: '5px', fontFamily: 'Ownglyph_ryuttung-Rg' }}
        />
        <button onClick={handleSendFriendRequest} style={{ fontFamily: 'Ownglyph_ryuttung-Rg' }}>요청 보내기</button>
      </div>

      <div style={{ marginBottom: '30px', borderBottom: '1px solid #ddd', paddingBottom: '20px' }}>
        <h3>친구 요청 관리 ({friendRequests.length}개)</h3>
        {friendRequests.length === 0 ? (
          <p>받은 친구 요청이 없습니다.</p>
        ) : (
          <ul>
            {friendRequests.map(request => (
              <li key={request.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span>{request.fromNickname}님의 친구 요청</span>
                <div>
                  <button onClick={() => handleAcceptRequest(request)} style={{ fontFamily: 'Ownglyph_ryuttung-Rg', marginRight: '5px', backgroundColor: '#4CAF50', color: 'white' }}>수락</button>
                  <button onClick={() => handleRejectRequest(request.id)} style={{ fontFamily: 'Ownglyph_ryuttung-Rg', backgroundColor: '#f44336', color: 'white' }}>거절</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3>내 친구 목록 ({friends.length}명)</h3>
        {friends.length === 0 ? (
          <p>등록된 친구가 없습니다.</p>
        ) : (
          <ul>
            {friends.map(friend => (
              <li key={friend.uid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span>{friend.nickname} ({friend.email})</span>
                <button onClick={() => handleRemoveFriend(friend.uid, friend.nickname)} style={{ fontFamily: 'Ownglyph_ryuttung-Rg', backgroundColor: '#f44336', color: 'white' }}>삭제</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MyPage;