import type { ErrorComponent } from "../routes/types";

/**
 * Trang lỗi chung, kèm nút tải lại toàn trang để người dùng thử lại.
 * Không hiển thị chi tiết lỗi cho người dùng, chi tiết đã có trong console.
 */
const ErrorPage: ErrorComponent = (_error, ctx) => {
  const page = document.createElement("section");
  page.innerHTML = `
    <h1>Đã có lỗi xảy ra</h1>
    <p>Không thể mở trang này.</p>
    <button type="button" id="reload">Tải lại trang</button>
  `;

  page
    .querySelector("#reload")
    ?.addEventListener("click", () => window.location.reload(), {
      signal: ctx.signal,
    });

  return page;
};

export default ErrorPage;
