import React, { useEffect, useState } from 'react';
import pin from '../../assets/pin.jpg';

export default function EmployeeOfMonthCarousel() {
  // 이달의 사원 예시 데이터 (원하면 props로 대체 가능)
  const eomList = [
    {
      name: '홍길동',
      dept: '영업팀',
      comment: '항상 밝은 에너지로 팀을 이끄는 홍길동님!',
      img: pin,
    },
    // {
    //   name: '김철수',
    //   dept: '개발팀',
    //   comment: '혁신적인 아이디어로 프로젝트를 성공시킨 김철수님!',
    //   img: pin,
    // },
    // {
    //   name: '이영희',
    //   dept: '인사팀',
    //   comment: '세심한 배려로 모두를 챙기는 이영희님!',
    //   img: pin,
    // },
  ];
  const [eomIndex, setEomIndex] = useState(0);
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
              <img src={eom.img} alt='이달의 사원' />
            </div>
            <div className='eom-info'>
              <div className='eom-name'>{eom.name}</div>
              <div className='eom-dept'>{eom.dept}</div>
              <div className='eom-comment'>"{eom.comment}"</div>
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
}
