# Những gì router còn thiếu

Router hiện tại cố ý chỉ giữ phần lõi. Các mục dưới đây đã được bỏ ra và có thể thêm lại khi cần, xếp từ dễ đến khó.
Hãy đánh dấu khi làm xong.

## Dễ

- [ ] **`aria-current` cho link đang active.** Thanh điều hướng hiện không còn được tô màu dù CSS `a[aria-current="page"]` vẫn còn trong `style.css`.
      Sau khi render, duyệt `document.querySelectorAll("a[href]")` rồi gắn hoặc gỡ thuộc tính theo `pathname`.
- [ ] **Thanh loading.** CSS `html[data-route-loading]` vẫn còn. Thêm option `onLoadingChange`, gọi `true` khi bắt đầu `run()` và `false` khi kết thúc hoặc huỷ.
- [ ] **Focus sau khi đổi trang.** Trình đọc màn hình và người dùng bàn phím đang bị kẹt ở link vừa bấm.
      Đặt `tabIndex = -1` cho `#outlet`, rồi gọi `root.focus({ preventScroll: true })` sau khi render, trừ lần đầu.
- [ ] **Title động.** `title` hiện chỉ nhận chuỗi, nên `/users/:id` chỉ hiện "Người dùng". Cho phép `ctx => string`, hoặc để page tự gán `document.title`.
- [ ] **Redirect khai báo trong route.** Route `/gioi-thieu` đã bị xoá nên giờ ra trang 404. Thêm `redirect: string` vào route rồi xử lý trước khi chạy page.
- [ ] **Escape phần tĩnh của path.** `/v1.0` đang khớp cả `/v1x0` vì `.` là ký tự đặc biệt của regex.
- [ ] **Link bỏ qua router.** Link tới `/report.pdf` hiện bị router bắt và ra trang 404, trừ khi có `target` hoặc `download`. Thêm `data-external` trong `handleClick`.
- [ ] **Link `data-replace`.** Truyền `{ replace: "replace" in link.dataset }` vào `navigate()` trong `handleClick`.
- [ ] **Wildcard `/docs/*`.** Chỉ có `*` bắt mọi đường dẫn. Thêm một nhánh trong `compilePath`, trả `(.*)` và key `wildcard`.

## Trung bình

- [ ] **Guard.** Kiểm tra đăng nhập hiện nằm ngay trong `DashboardPage` và `LoginPage`. Thêm `beforeEach`, `beforeEnter` và `meta` để gom về một chỗ.
      Guard chạy trước page và trả về đường dẫn để redirect, nhớ giới hạn số lần redirect liên tiếp để tránh vòng lặp vô hạn.
      Làm xong mục này cũng sửa được lỗi: mở thẳng `/dashboard` khi chưa đăng nhập rồi bấm Back sẽ lại bị đẩy về `/login`,
      vì `/dashboard` đã có sẵn trong history. Guard cần thay entry đó khi redirect, thay vì thêm mới.
- [ ] **Cuộn tới hash khi mở trang.** Mở thẳng `/about#team`, hoặc `navigate("/about#team")`, đang không cuộn vì nội dung render sau khi trang tải xong.
      Sau khi render, tìm phần tử bằng `getElementById` rồi gọi `scrollIntoView()`.
- [ ] **Huỷ lần đang chờ khi Back trong cùng trang.** Đang chờ mở trang khác mà bấm Back giữa các hash của trang hiện tại thì lần đang chờ vẫn tiếp tục. Abort `pending` ở nhánh `isSamePage`.
- [ ] **Hook `afterEach`.** Thêm mảng hook và gọi ở cuối `run()`, hợp để gửi analytics.
- [ ] **Truyền `state`.** Thêm vào `NavigateOptions` và `ctx`, truyền vào `pushState`, đọc lại từ `history.state`.
- [ ] **Render lại cùng URL (`force`).** `navigate()` đang bỏ qua khi URL không đổi.
- [ ] **Lazy load.** Thêm dạng route `lazy: () => import("../pages/AboutPage")` để Vite tách chunk. Khi đó nên import tĩnh trang lỗi, vì lỗi có thể chính là do không tải được chunk.
- [ ] **Preload khi hover.** Làm sau lazy load: nghe `pointerover` và `focusin`, gọi trước `route.lazy()`.

## Khó

- [ ] **Nhớ vị trí cuộn chính xác.** Khi Back/Forward, trình duyệt có thể khôi phục lệch vì trang render sau khi URL đổi.
      Lưu `{ position }` vào `history.state`, đặt `history.scrollRestoration = "manual"`, lưu `scrollY` theo `position` và khôi phục sau khi render.
- [ ] **Guard chặn bằng `false`.** Làm sau guard và `position`. Khi nhận `popstate` thì URL đã đổi rồi, nên muốn ở lại phải gọi `history.go(hiện tại - đích)` và bỏ qua lần `popstate` do chính lệnh đó sinh ra.
- [ ] **Nested layout.** Hiện chỉ có một vùng `#outlet`, phần dùng chung nằm trong `index.html`.
- [ ] **Deploy dưới đường dẫn con** như `/app/`. Cần option `base`, cắt khi so khớp và ghép lại khi ghi URL.
