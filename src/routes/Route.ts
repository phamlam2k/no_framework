import { find } from "../utils/functions";
import type {
  NavigateOptions,
  PageResult,
  RouteContext,
  RouteParams,
  RouteProps,
  RouterOptions,
} from "./types";

type CompiledRoute = RouteProps & { pattern: RegExp; keys: string[] };

/** Ví dụ `/users/:id` => regex `^/users/([^/]+)/?$` và keys `["id"]`. */
function compilePath(path: string) {
  if (path === "*") return { pattern: /.*/, keys: [] };

  const keys: string[] = [];
  const source = path.replace(/:(\w+)/g, (_, key: string) => {
    keys.push(key);
    return "([^/]+)";
  });

  return { pattern: new RegExp(`^${source}/?$`), keys };
}

/** URL lỗi như `/users/%E0%A4%A` làm `decodeURIComponent` ném lỗi, nên giữ giá trị gốc. */
function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function createContext(
  url: URL,
  signal: AbortSignal,
  route?: CompiledRoute
): RouteContext {
  const params: RouteParams = {};
  const match = route?.pattern.exec(url.pathname);
  route?.keys.forEach((key, index) => {
    params[key] = safeDecode(match?.[index + 1] ?? "");
  });

  return { url, params, query: url.searchParams, signal };
}

class Router {
  private routes: CompiledRoute[] = [];
  private options: RouterOptions;
  /** URL của trang đang hiển thị. */
  private current: URL | null = null;
  /** Controller của trang đang chuẩn bị, chưa hiển thị. */
  private pending: AbortController | null = null;
  /** Controller của trang đang hiển thị, abort khi rời trang. */
  private active: AbortController | null = null;

  constructor(options: RouterOptions) {
    this.options = options;
  }

  /** Đăng ký route. Route khai báo trước được ưu tiên khi so khớp. */
  public addRoute(route: RouteProps) {
    this.routes.push({ ...route, ...compilePath(route.path) });
  }

  /** Gắn listener và render trang theo URL hiện tại. */
  public start() {
    document.addEventListener("click", this.handleClick);
    window.addEventListener("popstate", this.handlePopState);
    return this.run(new URL(window.location.href));
  }

  /** Điều hướng bằng code. Promise bị reject nếu `to` khác origin. */
  public async navigate(to: string, options: NavigateOptions = {}) {
    const url = new URL(to, window.location.href);

    // Chặn `//evil.com` khi đích đến lấy từ dữ liệu ngoài như `?redirect=`.
    if (url.origin !== window.location.origin) {
      throw new Error(`Router chỉ điều hướng trong cùng origin: "${to}"`);
    }

    // Đã ở đúng URL này: chỉ cần huỷ lần điều hướng đang dở, nếu có.
    if (url.href === window.location.href) {
      this.pending?.abort();
      return;
    }

    await this.run(url, options.replace ? "replace" : "push");
  }

  /**
   * Quy trình của mọi lần điều hướng:
   * 1. Huỷ lần đang dở, lần mới nhất luôn thắng.
   * 2. Chạy page và chờ kết quả, trong lúc này trang cũ vẫn hiển thị.
   * 3. Đổi URL rồi đổi DOM.
   *
   * `mode` để trống khi URL đã có sẵn trên trình duyệt: tải trang lần đầu, Back/Forward.
   */
  private async run(url: URL, mode?: "push" | "replace") {
    this.pending?.abort();
    const controller = new AbortController();
    const { signal } = controller;
    this.pending = controller;

    const route = find(this.routes, item => item.pattern.test(url.pathname));

    if (!route) throw new Error(`Không có route cho "${url.pathname}"`);
    
    const ctx = createContext(url, signal, route);
    let content: PageResult;

    try {
      content = await route.component(ctx);
    } catch (error) {
      if (signal.aborted) return;
      console.error("[router] Điều hướng thất bại:", error);
      content =
        this.options.errorComponent?.(error, ctx) ??
        "<h1>Đã có lỗi xảy ra</h1>";
    }

    // Trong lúc chờ page, có thể đã có lần điều hướng mới chen ngang.
    if (signal.aborted) return;

    if (mode === "push") window.history.pushState(null, "", url.href);
    if (mode === "replace") window.history.replaceState(null, "", url.href);

    // Dừng listener, fetch, timer của trang cũ rồi mới đổi DOM.
    this.active?.abort();
    this.active = controller;
    this.pending = null;
    this.current = url;

    this.render(content);
    if (route?.title) document.title = route.title;
    if (mode) window.scrollTo(0, 0);
  }

  private render(content: PageResult) {
    const root = document.querySelector(this.options.root);
    if (!root) throw new Error(`Không tìm thấy "${this.options.root}"`);

    if (typeof content === "string") root.innerHTML = content;
    else if (content instanceof Node) root.replaceChildren(content);
    else root.replaceChildren();
  }

  /** Bắt click ở cấp document, nên link render sau cũng hoạt động. */
  private handleClick = (event: MouseEvent) => {
    // Giữ hành vi mở tab mới của Ctrl/Cmd/Shift + click và chuột giữa.
    const hasModifier =
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (event.defaultPrevented || event.button !== 0 || hasModifier) return;
    if (!(event.target instanceof Element)) return;

    const link = event.target.closest("a[href]");
    if (!(link instanceof HTMLAnchorElement)) return;
    if (link.origin !== window.location.origin) return;
    if (link.target && link.target !== "_self") return;
    if (link.hasAttribute("download")) return;

    // Link hash trên cùng trang: để trình duyệt tự đổi URL và cuộn.
    const isSamePage =
      link.pathname === window.location.pathname &&
      link.search === window.location.search;
    if (isSamePage && link.href.includes("#")) return;

    event.preventDefault();
    void this.navigate(link.href);
  };

  /** Xử lý Back/Forward: URL trên trình duyệt đã đổi, chỉ cần render theo. */
  private handlePopState = () => {
    const url = new URL(window.location.href);

    // Chỉ khác hash: trình duyệt tự cuộn. Chrome cũng phát `popstate` khi click link hash.
    const isSamePage =
      url.pathname === this.current?.pathname &&
      url.search === this.current.search;
    if (!isSamePage) void this.run(url);
  };
}

export default Router;
