import { navigate } from "../router";
import type { PageComponent } from "../routes/types";
import { isLoggedIn, setLoggedIn } from "../utils/auth";

/** Trang cần đăng nhập: chưa đăng nhập thì chuyển sang login, kèm đường dẫn để quay lại. */
const DashboardPage: PageComponent = ctx => {
  if (!isLoggedIn()) {
    const redirect = encodeURIComponent(ctx.url.pathname + ctx.url.search);
    void navigate(`/login?redirect=${redirect}`);
    return;
  }

  const page = document.createElement("section");
  page.innerHTML = `
    <h1>Dashboard</h1>
    <button type="button" id="logout">Đăng xuất</button>
  `;

  page.querySelector("#logout")?.addEventListener(
    "click",
    () => {
      setLoggedIn(false);
      void navigate("/", { replace: true });
    },
    { signal: ctx.signal }
  );

  return page;
};

export default DashboardPage;
