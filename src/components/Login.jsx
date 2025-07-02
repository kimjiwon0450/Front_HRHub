import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // 쿼리 파싱용
import './Login.scss';
import axios from 'axios';
import { API_BASE_URL, HR_SERVICE } from '../configs/host-config';
import UserContext from '../context/UserContext';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Login() {
  const navigate = useNavigate();
  const query = useQuery();
  const emailParam = query.get('email'); // 주소에 ?email=xxx 있으면 값, 없으면 null
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const isResetMode = !!emailParam; // email 쿼리가 있으면 "비번 재설정" 모드
  const { onLogin, isLoggedIn } = useContext(UserContext);

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, []);
  // email 쿼리가 들어오면 초기값 셋팅
  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  const verifyPassword = () => {
    if (!newPassword || !newPasswordConfirm) {
      alert('새 비밀번호를 입력해주세요.');
      return false;
    } else if (newPassword !== newPasswordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return false;
    }
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isResetMode) {
      if (!verifyPassword()) {
        return;
      }
      try {
        await axios.patch(`${API_BASE_URL}${HR_SERVICE}/employees/password`, {
          email,
          password: newPassword,
        });
      } catch (error) {
        alert(error.response.data.statusMessage);
      }
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE_URL}${HR_SERVICE}/employees/login`,
        {
          email,
          password,
        },
      );
      onLogin(res.data.result);
      navigate('/dashboard');
    } catch (error) {
      alert(error.response.data.statusMessage);
    }
  };

  return (
    <div className='login-container'>
      <div className='login-box'>
        <img src='/logo.png' alt='PetWiz ERP' className='logo' />
        <form className='login-form' onSubmit={handleSubmit}>
          {/* 로그인 or 비밀번호 재설정 분기 */}
          <label htmlFor='email'>Email address</label>
          <input
            type='email'
            id='email'
            placeholder='email@example.com'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            readOnly={isResetMode}
          />

          {isResetMode ? (
            // 비밀번호 재설정 모드
            <>
              <label htmlFor='newPassword'>새 비밀번호 입력</label>
              <input
                type='password'
                id='newPassword'
                placeholder='새 비밀번호'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <label htmlFor='newPasswordConfirm'>새 비밀번호 확인</label>
              <input
                type='password'
                id='newPasswordConfirm'
                placeholder='새 비밀번호 확인'
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
              />
              <button type='submit'>비밀번호 변경</button>
            </>
          ) : (
            // 일반 로그인 모드
            <>
              <label htmlFor='password'>Password</label>
              <input
                type='password'
                id='password'
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className='options'>
                <label>
                  <input type='checkbox' />
                  Remember me
                </label>
              </div>
              <button type='submit'>Sign in</button>

              <div className='forgot'>
                <a href='#'>비밀번호를 잊어버리셨나요?</a>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
