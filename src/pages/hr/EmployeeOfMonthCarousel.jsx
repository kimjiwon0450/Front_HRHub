import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL, HR_SERVICE } from '../../configs/host-config';
import axiosInstance from '../../configs/axios-config';

const EmployeeOfMonthCarousel = () => {
  const [eomList, setEomList] = useState([]);

  console.log(`${API_BASE_URL}${HR_SERVICE}/top/employee`);
  
  // 자동 슬라이드
  useEffect(() => {
    if (eomList.length <= 1) return;
    const timer = setInterval(() => {
      setEomIndex((prev) => (prev + 1) % eomList.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [eomList.length]);

  return (
    <div className='employee-of-month'>
      <div className='eom-slider'>
        {eomList.map((eom, idx) => (
          <div
            key={eom.name}
            className={`eom-slide${idx === eomIndex ? ' active' : ''}`}
          >
            <div className='eom-avatar'>
              <img src={eom.profileImageUri} alt='이달의 사원' />
            </div>
            <div className='eom-info'>
              <div className='eom-name'>{eom.name}</div>
              <div className='eom-dept'>{eom.departmentId}</div>
              <div className='eom-comment'>"{eom.memo}"</div>
            </div>
          </div>
        ))}
        {/* 페이지네이션 */}
        <div className='eom-pagination'>
          {eomList.map((_, idx) => (
            <span
              key={idx}
              className={idx === eomIndex ? 'active' : ''}
              onClick={() => setEomIndex(idx)}
            ></span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeOfMonthCarousel;
