import AboutPage from "../pages/AboutPage";
import DashboardPage from "../pages/DashboardPage";
import ErrorPage from "../pages/ErrorPage";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import UserPage from "../pages/UserPage";
import Router from "./Route";

const router = new Router({
  root: "#outlet",
  errorComponent: ErrorPage,
});

router.addRoute({ path: "/", title: "Trang chủ", component: HomePage });
router.addRoute({ path: "/about", title: "Giới thiệu", component: AboutPage });

// Route động: `:id` được đọc qua `ctx.params.id`.
router.addRoute({
  path: "/users/:id",
  title: "Người dùng",
  component: UserPage,
});

router.addRoute({ path: "/login", title: "Đăng nhập", component: LoginPage });
router.addRoute({
  path: "/dashboard",
  title: "Dashboard",
  component: DashboardPage,
});

// Luôn đặt cuối cùng vì `*` khớp với mọi đường dẫn.
router.addRoute({
  path: "*",
  title: "Không tìm thấy trang",
  component: NotFoundPage,
});

export default router;
