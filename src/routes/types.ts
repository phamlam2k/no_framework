/** Tham số động lấy từ URL. Ví dụ `/users/:id` + `/users/42` => `{ id: "42" }`. */
export type RouteParams = Record<string, string>;

/** Thông tin về route đang được điều hướng tới, truyền cho page. */
export interface RouteContext {
  /** URL đầy đủ của lần điều hướng. */
  readonly url: URL;
  /** Tham số động trên path. */
  readonly params: RouteParams;
  /** Query string, ví dụ `query.get("tab")`. */
  readonly query: URLSearchParams;
  /**
   * Bị abort khi rời trang hoặc khi lần điều hướng này bị huỷ giữa chừng.
   * Truyền vào `fetch` và `addEventListener` để tự dọn dẹp.
   */
  readonly signal: AbortSignal;
}

/**
 * Kết quả render của page.
 * - `Node`: chèn thẳng vào DOM, an toàn với dữ liệu động.
 * - `string`: gán qua `innerHTML`, KHÔNG được nối trực tiếp dữ liệu từ URL hoặc
 *   người dùng vào chuỗi vì sẽ dính XSS.
 */
export type PageResult = string | Node | void;

/** Một page là một hàm nhận context, có thể async để tải dữ liệu trước khi hiện. */
export type PageComponent = (
  ctx: RouteContext
) => PageResult | Promise<PageResult>;

/** Hàm render trang lỗi. */
export type ErrorComponent = (error: unknown, ctx: RouteContext) => PageResult;

export interface RouteProps {
  /** Mẫu đường dẫn: tĩnh `/about`, động `/users/:id`, hoặc `*` để bắt mọi đường dẫn. */
  path: string;
  /** Tiêu đề tab trình duyệt. */
  title?: string;
  component: PageComponent;
}

export interface RouterOptions {
  /** CSS selector của phần tử chứa trang. */
  root: string;
  errorComponent?: ErrorComponent;
}

export interface NavigateOptions {
  /** Thay entry hiện tại thay vì thêm mới, nút Back sẽ không quay về trang này. */
  replace?: boolean;
}
