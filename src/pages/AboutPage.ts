import type { PageComponent } from "../routes/types";

/** Trang tĩnh: trả về chuỗi HTML cố định, kèm ví dụ cuộn tới hash `#team`. */
const AboutPage: PageComponent = () => `
  <section>
    <h1>Giới thiệu</h1>
    <p><a href="#team">Xem đội ngũ</a></p>
    <div class="spacer"></div>
    <h2 id="team">Đội ngũ</h2>
  </section>
`;

export default AboutPage;
