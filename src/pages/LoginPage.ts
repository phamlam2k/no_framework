import { navigate } from "../router";
import type { PageComponent } from "../routes/types";
import { isLoggedIn, setLoggedIn } from "../utils/auth";

/** Trang đăng nhập giả: đăng nhập xong quay về trang người dùng định vào. */
const LoginPage: PageComponent = ctx => {
  // Đã đăng nhập thì không cần vào trang login nữa.
  if (isLoggedIn()) {
    void navigate("/dashboard");
    return;
  }

  const page = document.createElement("section");
  page.innerHTML = `
    <h1>Đăng nhập</h1>
    <button type="button" id="login">Đăng nhập (demo)</button>
  `;

  page.querySelector("#login")?.addEventListener(
    "click",
    () => {
      setLoggedIn(true);
      // `?redirect=` do người khác điều khiển được. `navigate` từ chối URL khác
      // origin, khi đó quay về dashboard. `replace` để Back không về lại login.
      navigate(ctx.query.get("redirect") ?? "/dashboard", {
        replace: true,
      }).catch(() => navigate("/dashboard", { replace: true }));
    },
    { signal: ctx.signal }
  );

  return page;
};

export default LoginPage;
