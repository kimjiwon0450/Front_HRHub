import axios from 'axios';
import { USER_SERVICE } from './host-config';

const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청용 인터셉터
// 1번째 콜백에는 정상 동작 로직, 2번째 콜백에는 과정 중 에러 발생 시 실행할 함수
axiosInstance.interceptors.request.use(
  (config) => {
    // 요청 보내기 전에 항상 처리해야 할 내용을 콜백으로 전달.
    const token = localStorage.getItem('ACCESS_TOKEN');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },

  (error) => {
    console.log(error);
    Promise.reject(error);
  },
);

// 응답용 인터셉터
axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    console.log('response interceptor 동작함! 응답에 문제가 발생!');
    console.log(error);

    if (error.response.data.message === 'NO_LOGIN') {
      console.log('아예 로그인을 하지 않아서 재발급 요청 들어갈 수 없음!');
      return Promise.reject(error);
    }

    // 원래의 요청 정보를 기억
    const originalRequest = error.config;

    // 토큰 재발급 로직 작성
    if (error.response.status === 401) {
      console.log('응답상태 401 발생! 토큰 재발급 필요!');

      try {
        const id = localStorage.getItem('USER_ID');

        const res = await axios.post(
          `http://localhost:8000${USER_SERVICE}/user/refresh`,
          {
            id,
          },
        );
        const newToken = res.data.result.token;
        localStorage.setItem('ACCESS_TOKEN', newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        axiosInstance.defaults.headers.Authorization = `Bearer ${newToken}`;

        // axiosInstance를 사용하여 다시한번 원본 요청을 보내고, 응답은 원래 호출한 곳으로 리턴
        return axiosInstance(originalRequest);
      } catch (error) {
        console.log(error);
        // 백엔드에서 401을 보낸거 -> Refresh도 만료된 상황 (로그아웃처럼 처리해줘야 함.)
        localStorage.clear();
        // 재발급 요청도 거절당하면 인스턴스를 호출한 곳으로 에러 정보 리턴.
        return Promise.reject(error);
      }
    }
  },
);

export default axiosInstance;
