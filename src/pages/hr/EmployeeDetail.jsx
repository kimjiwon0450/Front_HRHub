import React from 'react';
import './EmployeeDetail.scss';
import HRHeader from './HRHeader';

export default function EmployeeDetail() {
  return (
    <>
      <HRHeader />
      <div className='emp-detail-root'>
        <div className='emp-detail-topbar'>
          <span className='crumb'>홈 &gt; 인사조회</span>
        </div>

        <div className='emp-detail-main'>
          <div className='emp-profile'>
            <img
              src='https://cdn.pixabay.com/photo/2017/01/31/13/14/avatar-2026510_960_720.png'
              alt='profile'
            />
          </div>
          <table className='emp-info-table'>
            <tbody>
              <tr>
                <th>이름</th>
                <td></td>
                <th>생년월일</th>
                <td></td>
                <th>나이</th>
                <td></td>
              </tr>
              <tr>
                <th>사번</th>
                <td></td>
                <th>재직상태</th>
                <td></td>
                <th>입사구분</th>
                <td></td>
              </tr>
              <tr>
                <th>입사일</th>
                <td></td>
                <th>근속년월</th>
                <td></td>
                <th>퇴사일</th>
                <td></td>
              </tr>
              <tr>
                <th>근무부서</th>
                <td colSpan={3}></td>
                <th>직무/단계</th>
                <td></td>
              </tr>
              <tr>
                <th>주소</th>
                <td colSpan={3}></td>
                <th>전화번호</th>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 요약정보 */}
        <div className='emp-section'>
          <div className='emp-section-title'>| 요약정보</div>
          <table className='emp-summary-table'>
            <tbody>
              <tr>
                <th>학력(학위)</th>
                <td></td>
              </tr>
              <tr>
                <th>경력(최근2개)</th>
                <td></td>
              </tr>
              <tr>
                <th>포상/징계(건수)</th>
                <td></td>
              </tr>
              <tr>
                <th>최근 3년 평</th>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 학력사항 */}
        <div className='emp-section'>
          <div className='emp-section-title'>| 학력사항</div>
          <table className='emp-edu-table'>
            <thead>
              <tr>
                <th>졸업구분</th>
                <th>학교명</th>
                <th>전공</th>
                <th>학위</th>
                <th>입학일</th>
                <th>졸업일</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 하단 버튼 */}
        <div className='emp-btns'>
          <button className='btn blue'>직원정보 수정</button>
          <button className='btn blue'>직원정보 삭제</button>
          <button className='btn green'>인사평가</button>
        </div>
      </div>
    </>
  );
}
