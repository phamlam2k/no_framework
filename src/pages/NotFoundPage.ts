import type { PageComponent } from "../routes/types";

/** Trang 404, được route `*` dùng khi không có route nào khác khớp. */
const NotFoundPage: PageComponent = () => `
  <section>
    <h1>404</h1>
    <p>Không tìm thấy trang. <a href="/">Về trang chủ</a></p>
  </section>
`;

export default NotFoundPage;
