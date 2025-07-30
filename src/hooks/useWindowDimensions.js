// /src/hooks/useWindowDimensions.js

import { useState, useEffect } from 'react';

// 브라우저 창의 현재 크기를 가져오는 헬퍼 함수
function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}

/**
 * 브라우저 창의 너비와 높이를 실시간으로 추적하는 커스텀 훅입니다.
 * @returns {{width: number, height: number}} 현재 창의 너비와 높이를 담은 객체
 */
export default function useWindowDimensions() {
  // 1. 컴포넌트의 state로 창 크기를 관리합니다. 초기값은 현재 창 크기입니다.
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    // 2. 브라우저 창 크기가 변경될 때마다 state를 업데이트하는 함수를 정의합니다.
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    // 3. resize 이벤트가 발생할 때마다 handleResize 함수가 실행되도록 이벤트 리스너를 등록합니다.
    window.addEventListener('resize', handleResize);

    // 4. 컴포넌트가 언마운트될 때(사라질 때) 이벤트 리스너를 정리(제거)합니다.
    //    이렇게 하지 않으면 메모리 누수가 발생할 수 있습니다.
    return () => window.removeEventListener('resize', handleResize);
  }, []); // 빈 배열을 전달하여 이 effect가 컴포넌트 마운트 시 한 번만 실행되도록 합니다.

  return windowDimensions;
}