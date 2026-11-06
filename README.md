# request-madoka-fe

SPA viết bằng TypeScript thuần, **không dùng framework**. Dự án tự xây một client-side router nhỏ trên History API,
giữ phần lõi gọn để dễ đọc và dễ mở rộng.

## Tính năng

- Route tĩnh (`/about`), route động (`/users/:id`) và route bắt mọi đường dẫn (`*`).
- Page là một hàm nhận `ctx` (`params`, `query`, `url`, `signal`), có thể là hàm async để tải dữ liệu trước khi hiển thị.
- Lần điều hướng mới nhất luôn thắng: trang tải chậm không đè lên trang người dùng vừa chọn.
- Tự dọn dẹp khi rời trang qua `AbortSignal` (listener, `fetch`, timer).
- Tự bắt click vào thẻ `<a>`, kể cả link render sau; giữ nguyên Ctrl/Cmd/Shift + click, `target`, `download` và link ngoài.
- `navigate()` chặn điều hướng khác origin để tránh open redirect.
- Trang lỗi và trang 404 tuỳ chỉnh.

## Yêu cầu

- Node.js bản mới (Vite 8)
- [pnpm](https://pnpm.io/)

## Bắt đầu

```bash
pnpm install
pnpm dev       # chạy dev server
pnpm build     # kiểm tra kiểu bằng tsc rồi build ra dist/
pnpm preview   # xem thử bản build
```

## Cấu trúc thư mục

```
├── index.html            # Khung trang, thanh điều hướng và vùng #outlet
├── public/               # File tĩnh
├── docs/                 # Tài liệu router
└── src/
    ├── main.ts           # Điểm vào, gọi startRouter(router)
    ├── router.ts         # Giữ router đang chạy, export navigate()
    ├── routes/
    │   ├── index.ts      # Khai báo route và trang lỗi
    │   ├── Route.ts      # Class Router
    │   └── types.ts      # Kiểu dữ liệu
    ├── pages/            # Các trang
    ├── utils/            # auth.ts (đăng nhập giả để minh hoạ), functions.ts
    └── style.css
```

## Ví dụ nhanh

Tạo page trong `src/pages/ProductPage.ts`:

```ts
import type { PageComponent } from "../routes/types";

const ProductPage: PageComponent = ctx => {
  const title = document.createElement("h1");
  title.textContent = `Sản phẩm ${ctx.params.id}`;
  return title;
};

export default ProductPage;
```

Khai báo trong `src/routes/index.ts`, đặt **trước** route `*`:

```ts
router.addRoute({ path: "/products/:id", title: "Sản phẩm", component: ProductPage });
```

Điều hướng bằng link `<a href="/products/1">` hoặc bằng code:

```ts
import { navigate } from "../router";

await navigate("/products/1");
await navigate("/dashboard", { replace: true });
```

> Luôn đọc URL từ `ctx` thay vì `window.location`, và dùng `textContent` cho dữ liệu từ URL, API hoặc người dùng để tránh XSS.

## Các trang mẫu

| Đường dẫn    | Minh hoạ                                                   |
| ------------ | ---------------------------------------------------------- |
| `/`          | Trang tĩnh                                                 |
| `/about`     | Trang tĩnh, link hash trong cùng trang                     |
| `/users/:id` | Route động, page async, đọc query `?tab=`                  |
| `/login`     | Đăng nhập giả, quay lại theo `?redirect=` một cách an toàn |
| `/dashboard` | Trang cần đăng nhập, chuyển hướng từ trong page            |
| `*`          | Trang 404                                                  |

## Deploy

Server phải trả `index.html` cho mọi đường dẫn không phải file tĩnh, nếu không F5 ở `/users/42` sẽ bị 404.
Ví dụ với nginx:

```nginx
location / {
  try_files $uri /index.html;
}
```

## Tài liệu

- [Hướng dẫn sử dụng router](docs/router-usage.md): thêm trang, viết page, điều hướng, xử lý sự cố.
- [Kiến trúc router](docs/router-architecture.md): quy trình điều hướng, vai trò của `AbortController`, các quyết định thiết kế.
- [Những gì còn thiếu](docs/router-todo.md): guard, lazy load, loading bar, nested layout và các tính năng khác.
