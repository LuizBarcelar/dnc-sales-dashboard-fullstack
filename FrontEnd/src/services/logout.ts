import Cookies from 'js-cookie'

export function logout() {
  Cookies.remove('Authorization')

  window.location.href = '/' 
}