import React from 'react';
import HRHeader from './HRHeader';
import './HRPage.scss';

export default function HRPage() {
  return (
    <div className='hrpage-root'>
      <HRHeader />
      {/* 유저 카드 + 검색/달력 */}
      <div className='hr-top'>
        <div className='hr-usercard'>
          <div className='user-avatar' />
          <div className='user-meta'>
            <div className='user-name'>
              <b>김지원</b> <span className='user-role'>관리자</span>
            </div>
            <div className='user-desc'>
              This is a wider card with supporting text below as a natural
              lead-in to additional content. This content is a little bit
              longer.
            </div>
            <div className='user-edit'>개인정보 수정</div>
          </div>
        </div>
        <div className='hr-tools'>
          <input className='search-input' placeholder='임직원 검색' />
          <button className='search-btn'>Search</button>
          <div className='calendar-mock'>
            <div className='calendar-title'>October 2014</div>
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
                <tr>
                  <td></td>
                  <td></td>
                  <td>1</td>
                  <td>2</td>
                  <td>3</td>
                  <td>4</td>
                  <td>5</td>
                </tr>
                <tr>
                  <td>6</td>
                  <td>7</td>
                  <td>8</td>
                  <td>9</td>
                  <td>10</td>
                  <td>11</td>
                  <td>12</td>
                </tr>
                <tr>
                  <td>13</td>
                  <td>14</td>
                  <td>15</td>
                  <td>16</td>
                  <td>17</td>
                  <td>18</td>
                  <td>19</td>
                </tr>
                <tr>
                  <td>20</td>
                  <td>21</td>
                  <td>22</td>
                  <td>23</td>
                  <td>24</td>
                  <td>25</td>
                  <td>26</td>
                </tr>
                <tr>
                  <td>27</td>
                  <td>28</td>
                  <td>29</td>
                  <td>30</td>
                  <td>31</td>
                  <td></td>
                  <td></td>
                </tr>
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
          {/* 휴가신청 */}
          <div className='hr-card hr-tab-card'>
            <div className='tabs'>
              <button className='active'>휴가신청</button>
              <div className='menu-icon'>≡</div>
            </div>
            <table className='mini-table'>
              <thead>
                <tr>
                  <th>구분</th>
                  <th>발생</th>
                  <th>사용</th>
                  <th>잔여</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>합계</td>
                  <td className='text-accent'>0</td>
                  <td>0</td>
                  <td className='text-error'>0</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* 공지사항 */}
          <div className='hr-card hr-tab-card'>
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
