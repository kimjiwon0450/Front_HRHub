import React, { useContext, useEffect, useState } from 'react';
import HRHeader from './HRHeader';
import './HRPage.scss';
import { UserContext } from '../../context/UserContext';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, HR_SERVICE } from '../../configs/host-config';
import pin from '../../assets/pin.jpg';
import EmployeeOfMonthCarousel from './EmployeeOfMonthCarousel';
import UserCard from './UserCard';
import CalendarWidget from './CalendarWidget';
import NoticeList from './NoticeList';

export default function HRPage() {
  const { userName, userRole, userImage, userPosition, departmentId, userId } =
    useContext(UserContext);
  const [departments, setDepartments] = useState([]);
  const [departmentName, setDepartmentName] = useState('');
  const [profileImageUri, setProfileImageUri] = useState('');

  // 달력 상태 및 유틸
  const today = new Date();
  const [calendarDate, setCalendarDate] = useState(new Date());
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); // 0:일~6:토
  const lastDate = new Date(year, month + 1, 0).getDate();
  // 달력은 월요일 시작(Mo=1)로 맞춤
  const getCalendarMatrix = () => {
    const matrix = [];
    let day = 1;
    let start = (firstDay + 6) % 7; // 일요일(0) -> 6, 월요일(1) -> 0
    for (let i = 0; i < 6; i++) {
      const row = [];
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < start) || day > lastDate) {
          row.push(null);
        } else {
          row.push(day++);
        }
      }
      matrix.push(row);
    }
    return matrix;
  };
  const calendarMatrix = getCalendarMatrix();
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const handlePrevMonth = () => {
    setCalendarDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCalendarDate(new Date(year, month + 1, 1));
  };

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await axiosInstance.get(
          `${API_BASE_URL}${HR_SERVICE}/departments`,
        );
        setDepartments(res.data.result || []);
      } catch (err) {
        setDepartments([]);
      }
    }
    fetchDepartments();
  }, []);

  useEffect(() => {
    console.log('departmentId:', departmentId, 'departments:', departments);
    if (!departmentId || !departments.length) {
      setDepartmentName('');
      return;
    }
    const found = departments.find(
      (d) => String(d.id) === String(departmentId),
    );
    setDepartmentName(found ? found.name : '');
  }, [departmentId, departments]);

  useEffect(() => {
    if (!userId) return;
    async function fetchEmployee() {
      try {
        const res = await axiosInstance.get(
          `${API_BASE_URL}${HR_SERVICE}/employees/${userId}`,
        );
        setProfileImageUri(res.data.result.profileImageUri || '');
      } catch (err) {
        setProfileImageUri('');
      }
    }
    fetchEmployee();
  }, [userId]);

  // 이달의 사원 예시 데이터
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
    <div className='hrpage-root'>
      {/* <HRHeader /> */}
      {/* 유저 카드 + 검색/달력 */}
      <div className='hr-top'>
        <UserCard
          userName={userName}
          userPosition={userPosition}
          departmentName={departmentName}
          profileImageUri={profileImageUri}
          onEditProfile={() => {}}
        />
        <div className='hr-tools'>
          <CalendarWidget
            calendarDate={calendarDate}
            setCalendarDate={setCalendarDate}
            today={today}
            calendarMatrix={calendarMatrix}
            monthNames={monthNames}
            handlePrevMonth={handlePrevMonth}
            handleNextMonth={handleNextMonth}
            year={year}
            month={month}
          />
        </div>
      </div>
      {/* 메인 카드 섹션 */}
      <div className='hr-main-cards'>
        <div className='hr-row'>
          {/* 신청한내역 */}
          <div className='hr-card hr-tab-card'>
            <div className='tabs'>
              <button className='active'>신청한내역</button>
              <button>결재한내역</button>
              <div className='menu-icon'>≡</div>
            </div>
            <table className='mini-table'>
              <thead>
                <tr>
                  <th>종류</th>
                  <th>신청일</th>
                  <th>상태</th>
                  <th>결재자</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>당직근무</td>
                  <td>24.12.12</td>
                  <td className='status-approve'>처리완료</td>
                  <td>김**</td>
                </tr>
                <tr>
                  <td>당직근무</td>
                  <td>25.02.05</td>
                  <td className='status-approve'>처리완료</td>
                  <td>김**</td>
                </tr>
                <tr>
                  <td>휴일근무</td>
                  <td>25.03.08</td>
                  <td className='status-approve'>처리완료</td>
                  <td>김**</td>
                </tr>
                <tr>
                  <td>야간근무</td>
                  <td>25.06.10</td>
                  <td className='status-pending'>수신반려</td>
                  <td>김**</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* 공지사항 */}
          <div className='hr-card hr-tab-card' style={{ flex: 2 }}>
            <div className='tabs'>
              <button className='active'>공지사항</button>
              <div className='menu-icon'>≡</div>
            </div>
            <NoticeList
              notices={[
                '정기 인사 발령 안내드립니다.(2025-06-10)',
                '정기 인사 발령 안내드립니다.(2025-02-10)',
                '정기 인사 발령 안내드립니다.(2024-10-10)',
              ]}
            />
          </div>
        </div>
        {/* 두번째 줄 */}
        <div className='hr-row'>
          {/* 우리팀 직원 */}
          <div className='hr-card hr-tab-card'>
            <div className='tabs'>
              <button className='active'>우리팀 직원</button>
              <div className='menu-icon'>≡</div>
            </div>
            <table className='mini-table'>
              <thead>
                <tr>
                  <th>성명</th>
                  <th>직급</th>
                  <th>연락처</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>유재석</td>
                  <td>팀장</td>
                  <td>010-1234-5678</td>
                </tr>
                <tr>
                  <td>김종국</td>
                  <td>대리</td>
                  <td>010-2345-6789</td>
                </tr>
                <tr>
                  <td>하하</td>
                  <td>사원</td>
                  <td>010-3456-7890</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* 자주 방문하는 사이트 */}
          <div className='hr-card hr-tab-card'>
            <div className='tabs'>
              <button className='active'>이달의 사원</button>
              <div className='menu-icon'>≡</div>
            </div>
            <EmployeeOfMonthCarousel />
          </div>
          {/* 자주 방문하는 메뉴 */}
          <div className='hr-card hr-tab-card'>
            <div className='tabs'>
              <button className='active'>자주 방문하는 메뉴</button>
              <div className='menu-icon'>≡</div>
            </div>
            <div className='visit-link'>
              <span className='icon-book'></span> 교육과정관리
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
