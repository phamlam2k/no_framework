import type { PageComponent } from "../routes/types";

interface User {
  id: string;
  name: string;
}

/**
 * Giả lập gọi API. Khi có API thật chỉ cần thay bằng `fetch(url, { signal })`:
 * rời trang giữa chừng thì request tự huỷ.
 */
function fetchUser(id: string, signal: AbortSignal): Promise<User> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve({ id, name: `User ${id}` }), 500);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });
}

/**
 * Trang động: page là hàm async nên router chờ có dữ liệu rồi mới đổi trang.
 * `params` lấy từ URL là dữ liệu không tin cậy, nên phải gán bằng `textContent`
 * thay vì nối vào chuỗi `innerHTML`.
 */
const UserPage: PageComponent = async ctx => {
  const user = await fetchUser(ctx.params.id, ctx.signal);

  const page = document.createElement("section");
  const title = document.createElement("h1");
  const tab = document.createElement("p");
  title.textContent = user.name;
  tab.textContent = `Tab: ${ctx.query.get("tab") ?? "mặc định"}`;
  page.append(title, tab);

  return page;
};

export default UserPage;
