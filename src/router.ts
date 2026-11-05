import type Router from "./routes/Route";
import type { NavigateOptions } from "./routes/types";

let active: Router | null = null;

/**
 * Khởi động router và đăng ký nó làm router dùng chung cho `navigate()`.
 * Gọi một lần duy nhất trong `main.ts`.
 */
export function startRouter(router: Router): Promise<void> {
  active = router;
  return router.start();
}

/**
 * Điều hướng từ bất kỳ đâu trong app.
 * Page import hàm này thay vì import bảng route, nhờ vậy không bị vòng lặp import.
 */
export function navigate(
  to: string,
  options: NavigateOptions = {}
): Promise<void> {
  if (!active) throw new Error("Router has not been started yet");
  return active.navigate(to, options);
}
