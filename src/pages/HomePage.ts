import { navigate } from "../router";
import type { PageComponent } from "../routes/types";

/** Trang chủ: minh hoạ `navigate()` và dọn listener tự động bằng `ctx.signal`. */
const HomePage: PageComponent = ctx => {
  const page = document.createElement("section");
  page.innerHTML = `
    <h1>Trang chủ</h1>
    <button type="button" id="go-to-user">Mở người dùng 42</button>
  `;

  page.querySelector("#go-to-user")?.addEventListener(
    "click",
    () => void navigate("/users/42?tab=profile"),
    // Listener tự gỡ khi rời trang.
    { signal: ctx.signal }
  );

  return page;
};

export default HomePage;
