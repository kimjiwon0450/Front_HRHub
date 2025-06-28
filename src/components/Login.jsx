import React from 'react';
import './Login.scss';

export default function Login() {
  return (
    <div className='login-container'>
      <div className='login-box'>
        <img src='/logo.png' alt='PetWiz ERP' className='logo' />
        <form className='login-form'>
          <label htmlFor='email'>Email address</label>
          <input type='email' id='email' placeholder='email@example.com' />

          <label htmlFor='password'>Password</label>
          <input type='password' id='password' placeholder='Password' />

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
        </form>
      </div>
    </div>
  );
}
