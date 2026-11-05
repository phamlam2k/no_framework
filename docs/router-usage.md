# Hướng dẫn sử dụng Router

Cách router hoạt động nằm ở [router-architecture.md](./router-architecture.md), những gì còn thiếu nằm ở [router-todo.md](./router-todo.md).

## Thêm một trang mới

**Bước 1:** tạo file `src/pages/ProductPage.ts`.

```ts
import type { PageComponent } from "../routes/types";

const ProductPage: PageComponent = ctx => {
  const title = document.createElement("h1");
  title.textContent = `Sản phẩm ${ctx.params.id}`;
  return title;
};

export default ProductPage;
```

**Bước 2:** khai báo trong `src/routes/index.ts`, đặt **trước** route `*`.

```ts
import ProductPage from "../pages/ProductPage";

router.addRoute({
  path: "/products/:id",
  title: "Sản phẩm",
  component: ProductPage,
});
```

Rồi trỏ link tới là xong: `<a href="/products/1">Sản phẩm 1</a>`.

## Khai báo route

| Thuộc tính  | Bắt buộc | Mô tả                             |
| ----------- | -------- | --------------------------------- |
| `path`      | Có       | `/about`, `/users/:id`, hoặc `*`. |
| `component` | Có       | Page để hiển thị.                 |
| `title`     | Không    | Tiêu đề tab trình duyệt.          |

**Route khai báo trước được ưu tiên.** Vì vậy `/users/new` phải đứng trước `/users/:id`, và `*` luôn đứng cuối.

## Viết một page

Page là một hàm nhận `ctx` và trả về `Node` hoặc chuỗi HTML, có thể là hàm async.

| `ctx`    | Ví dụ với `/users/42?tab=info`     |
| -------- | ---------------------------------- |
| `params` | `{ id: "42" }`                     |
| `query`  | `query.get("tab")` trả về `"info"` |
| `url`    | Object `URL` đầy đủ                |
| `signal` | Bị abort khi rời trang             |

Luôn đọc từ `ctx`, không đọc `window.location`: lúc page chạy, URL trên trình duyệt **vẫn là trang cũ**.

### Tải dữ liệu

Router chờ page xong rồi mới đổi trang. Nếu page ném lỗi, trang lỗi sẽ hiện ra.

```ts
const UserPage: PageComponent = async ctx => {
  const res = await fetch(`/api/users/${ctx.params.id}`, {
    signal: ctx.signal,
  });
  if (!res.ok) throw new Error(`API lỗi ${res.status}`);
  const user: { name: string } = await res.json();

  const title = document.createElement("h1");
  title.textContent = user.name;
  return title;
};
```

### Chuyển hướng từ trong page

Gọi `navigate()` rồi `return`. Lần điều hướng mới sẽ huỷ lần hiện tại, nên page này không được hiển thị. Xem `DashboardPage.ts`.

### Dọn dẹp khi rời trang

Không có hàm `unmount`, mọi thứ gắn vào `ctx.signal`:

```ts
// Listener, kể cả trên window hay document
window.addEventListener("resize", onResize, { signal: ctx.signal });

// Timer
const timer = setInterval(tick, 1000);
ctx.signal.addEventListener("abort", () => clearInterval(timer));
```

### Chống XSS

Chuỗi trả về được gán qua `innerHTML`. Dữ liệu từ URL, API hoặc người dùng phải đi qua `textContent`:

```ts
// SAI: /users/<img src=x onerror=...> sẽ chạy được script
const Unsafe: PageComponent = ctx => `<h1>${ctx.params.id}</h1>`;

// ĐÚNG
const Safe: PageComponent = ctx => {
  const title = document.createElement("h1");
  title.textContent = ctx.params.id;
  return title;
};
```

## Điều hướng

### Bằng link

Dùng thẻ `<a>` bình thường, router tự bắt, kể cả link được render sau.

```html
<a href="/about">Chuyển trang</a>
<a href="#team">Cuộn tới phần tử cùng trang</a>

<!-- Router không can thiệp -->
<a href="/about" target="_blank">Tab mới</a>
<a href="/file.zip" download>Tải xuống</a>
<a href="https://example.com">Trang ngoài</a>
```

Ctrl/Cmd/Shift + click và chuột giữa vẫn hoạt động như bình thường.

### Bằng code

```ts
import { navigate } from "../router";

await navigate("/users/42?tab=info");

// Thay entry hiện tại, Back sẽ không quay về trang này
await navigate("/dashboard", { replace: true });
```

Promise chỉ bị **reject** khi đích đến khác origin, ví dụ `//evil.com`.
Với đích lấy từ dữ liệu ngoài như `?redirect=`, hãy `catch` và chuyển về trang mặc định, xem `LoginPage.ts`.

## Deploy

Server phải trả `index.html` cho mọi đường dẫn không phải file tĩnh, nếu không F5 ở `/users/42` sẽ bị 404.
`pnpm dev` và `pnpm preview` đã tự làm việc này.

```nginx
location / {
  try_files $uri /index.html;
}
```

## Xử lý sự cố

| Hiện tượng                            | Nguyên nhân thường gặp                                          |
| ------------------------------------- | --------------------------------------------------------------- |
| Luôn vào trang 404                    | Route được khai báo sau `*`.                                    |
| `/users/new` hiện trang chi tiết user | `/users/:id` đứng trước `/users/new`.                           |
| Link tới file PDF hiện trang 404      | Link bị router bắt, hãy thêm `target="_blank"` hoặc `download`. |
| Page đọc ra URL của trang trước       | Đang dùng `window.location`, hãy đổi sang `ctx`.                |
| Sự kiện vẫn chạy sau khi rời trang    | Thiếu `{ signal: ctx.signal }` khi gắn listener.                |
| F5 ở trang con bị 404 sau khi deploy  | Server chưa cấu hình trả `index.html`.                          |
| Lỗi `Router has not been started yet` | Gọi `navigate()` trước `startRouter()`.                         |
