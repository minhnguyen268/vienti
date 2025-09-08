export const TINH_TRANG_USER = {
  TRUE: true,
  FALSE: false,
};
export const ROLE_USER = {
  USER: "user",
  ADMIN: "admin",
  EMPLOYEE: "employee",
  MANAGER: "manager",
};

export const MIN_LENGTH_PASSWORD = 6;
export const MIN_LENGTH_ACCOUNT = 6;
export const convertRole = (role) => {
  switch (role) {
    case ROLE_USER.USER:
      return "Người dùng";

    case ROLE_USER.ADMIN:
      return "Quản trị";

    case ROLE_USER.EMPLOYEE:
      return "Nhân viên";

    case ROLE_USER.MANAGER:
      return "Quản lý";

    default:
      return "";
  }
};

export const ADMIN_LIST_USER_PAGE_SIZE = 10;
export const ADMIN_USER_BALANCE_FLUCTUATIONS_PAGE_SIZE = 10;
