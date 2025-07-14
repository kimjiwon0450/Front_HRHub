export const removeLocalStorageForLogout = () => {
  localStorage.removeItem('ACCESS_TOKEN');
  localStorage.removeItem('USER_ID');
  localStorage.removeItem('USER_ROLE');
  localStorage.removeItem('USER_NAME');
  localStorage.removeItem('USER_DEPARTMENT_ID');
  localStorage.removeItem('USER_POSITION');
  localStorage.removeItem('USER_IMAGE');
  localStorage.removeItem('USER_ICON');
};
