// Đăng nhập GIẢ chỉ để minh hoạ guard. Khi có backend, thay file này bằng logic thật.
const KEY = "demo:logged-in";

/** Kiểm tra trạng thái đăng nhập. */
export function isLoggedIn(): boolean {
  return sessionStorage.getItem(KEY) === "1";
}

/** Đặt trạng thái đăng nhập. */
export function setLoggedIn(value: boolean) {
  if (value) sessionStorage.setItem(KEY, "1");
  else sessionStorage.removeItem(KEY);
}
