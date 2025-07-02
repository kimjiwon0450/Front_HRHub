import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../configs/host-config';


export const UserContext = React.createContext({
  isLoggedIn: false,
  onLogin: () => { },
  onLogout: () => { },
  userRole: '',
  userName: '',
  badge: null,
  setBadge: () => { },
  userId: null,
  userImage: '', // 유저 프로필사진
  setUserImage: () => { },
  isInit: false,
});

export const UserContextProvider = (props) => {
export const UserContextProvider = (props) => {
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [badge, setBadge] = useState(null);
  const [isInit, setIsInit] = useState(false);
  const [userImage, setUserImage] = useState('');
  const [departmentId, setDepartmentId] = useState(null);

  // 로그인 함수: 상태 + 배지까지 한 번에처리리
  const loginHandler = async (loginData) => {
    console.log('[loginHandler] 로그인 응답 데이터:', loginData);

    // 로컬스토리지 저장
    localStorage.setItem('ACCESS_TOKEN', loginData.token);
    localStorage.setItem('USER_ID', loginData.id);
    localStorage.setItem('USER_ROLE', loginData.role);
    localStorage.setItem('USER_NAME', loginData.name);
    // localStorage.setItem('USER_IMAGE', loginData.profileImage);
    localStorage.setItem('USER_DEPARTMENT_ID', loginData.departmentId);

    // 상태저장
    setIsLoggedIn(true);
    setUserId(loginData.id);
    setUserRole(loginData.role);
    setUserName(loginData.nickName);
    setUserImage(loginData.profileImage);
    setDepartmentId(loginData.departmentId);
  };

  const logoutHandler = () => {
    console.log('[logoutHandler] 로그아웃 수행');
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole('');
    setUserName('');
    setBadge(null);
    setUserImage('');
  };

  useEffect(() => {
    console.log('🌀 [useEffect] 초기 렌더링 시 로컬스토리지 확인');
    const storedToken = localStorage.getItem('ACCESS_TOKEN');

    if (storedToken) {
      const storedId = localStorage.getItem('USER_ID');
      const storedRole = localStorage.getItem('USER_ROLE');
      const storedName = localStorage.getItem('USER_NICKNAME');
      const storedBadge = localStorage.getItem('USER_ICON');
      const storedImage = localStorage.getItem('USER_IMAGE');
      const storedDepartmentId = localStorage.getItem('USER_DEPARTMENT_ID');

      setIsLoggedIn(true);
      setUserId(storedId);
      setUserRole(storedRole);
      setUserName(storedName);
      if (storedImage) {
        setUserImage(storedImage);
      }
      if (storedDepartmentId) {
        setDepartmentId(storedDepartmentId);
      }
      // 1차 로컬 복원
      if (storedBadge) {
        try {
          const parsed = JSON.parse(storedBadge);
          setBadge(parsed);
          console.log('📦 로컬 배지 복원됨:', parsed);
        } catch (e) {
          console.error('⚠️ 로컬 배지 파싱 실패:', e);
        }
      }
    }

    setIsInit(true);
  }, []);

  useEffect(() => {
    console.log('[badge state] 현재 badge 상태:', badge);
  }, [badge]);

  return (
    <UserContext.Provider
    <UserContext.Provider
      value={{
        isLoggedIn,
        onLogin: loginHandler,
        onLogout: logoutHandler,
        userRole,
        userName,
        userId,
        departmentId,
        badge,
        setBadge,
        userImage,
        setUserImage,
        isInit,
      }}
    >
      {props.children}
    </UserContext.Provider>
    </UserContext.Provider>
  );
};

export default UserContext;
export default UserContext;
