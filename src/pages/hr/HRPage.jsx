import React, { useContext, useEffect, useState } from 'react';
import HRHeader from './HRHeader';
import './HRPage.scss';
import { UserContext } from '../../context/UserContext';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, HR_SERVICE } from '../../configs/host-config';
import pin from '../../assets/pin.jpg';

export default function HRPage() {
  const { userName, userRole, userImage, departmentId, userId } =
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

  return (
    <div className='hrpage-root'>
      <HRHeader />
      {/* 유저 카드 + 검색/달력 */}
      <div className='hr-top'>
        <div className='hr-usercard'>
          <div className='user-avatar'>
            <img
              src={profileImageUri ? profileImageUri : pin}
              alt='profile'
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '1rem',
              }}
            />
          </div>
          <div className='user-meta'>
            <div className='user-name'>
              <b>{userName || '이름없음'}</b>{' '}
              <span className='user-role'>{userRole || '직급없음'}</span>
            </div>
            <div className='user-desc'>
              {departmentName ? `부서: ${departmentName}` : '부서 정보 없음'}
            </div>
            <div className='user-edit'>개인정보 수정</div>
          </div>
        </div>
        <div className='hr-tools'>
          <div className='calendar-mock'>
            <div
              className='calendar-title'
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <button
                style={{
                  border: 'none',
                  background: 'none',
                  fontSize: '1.1em',
                  cursor: 'pointer',
                }}
                onClick={handlePrevMonth}
              >
                &lt;
              </button>
              {monthNames[month]} {year}
              <button
                style={{
                  border: 'none',
                  background: 'none',
                  fontSize: '1.1em',
                  cursor: 'pointer',
                }}
                onClick={handleNextMonth}
              >
                &gt;
              </button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Mo</th>
                  <th>Tu</th>
                  <th>We</th>
                  <th>Th</th>
                  <th>Fr</th>
                  <th>Sa</th>
                  <th>Su</th>
                </tr>
              </thead>
              <tbody>
                {calendarMatrix.map((row, i) => (
                  <tr key={i}>
                    {row.map((date, j) => (
                      <td
                        key={j}
                        style={
                          date &&
                          today.getFullYear() === year &&
                          today.getMonth() === month &&
                          today.getDate() === date
                            ? {
                                background: '#2b80ff',
                                color: '#fff',
                                borderRadius: '50%',
                              }
                            : undefined
                        }
                      >
                        {date || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
            <ul className='notice-list'>
              <li>정기 인사 발령 안내드립니다.(2025-06-10)</li>
              <li>정기 인사 발령 안내드립니다.(2025-02-10)</li>
              <li>정기 인사 발령 안내드립니다.(2024-10-10)</li>
            </ul>
          </div>
        </div>
        {/* 두번째 줄 */}
        <div className='hr-row'>
          {/* 인사담당자 */}
          <div className='hr-card hr-tab-card'>
            <div className='tabs'>
              <button className='active'>인사담당자</button>
              <div className='menu-icon'>≡</div>
            </div>
            <table className='mini-table'>
              <thead>
                <tr>
                  <th>업무</th>
                  <th>성명</th>
                  <th>연락처</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>채용</td>
                  <td>유**</td>
                  <td>8875</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* 자주 방문하는 사이트 */}
          <div className='hr-card hr-tab-card'>
            <div className='tabs'>
              <button className='active'>자주 방문하는 사이트</button>
              <div className='menu-icon'>≡</div>
            </div>
            <div className='visit-link'>
              <span className='dollar'>$</span> 급여
            </div>
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
