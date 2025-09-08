import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setBalance, updateBalance } from "../redux/actions/balance";

const useRegisterWithdrawSocket = ({ value }) => {
  const dispatch = useDispatch();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (value.isConnected && value.socket) {
      value.socket.emit("get-users-withdraw", session.user.taiKhoan, (res) => {
        if (res && res.status === "success") {
          // dispatch(setBalance(res.data));
        } else if (res && res.status === "error") {
          // toast.error("Có lỗi xảy ra khi lấy thông tin rút tiền");
        }
      });

      value.socket.on("update-users-list", (data) => {
        console.log("update-users-list", data);
        // dispatch(updateBalance(data));
      });

      return () => {
        value.socket.off("update-users-list");
      };
    }
  }, [value]);
  return value;
};
export default useRegisterWithdrawSocket;
