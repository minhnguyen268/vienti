import UserService from "@/services/admin/UserService";
import { useEffect } from "react";
import { useQuery } from "react-query";
const useGetListUserRef = ({ userId }) => {
  const getData = async () => {
    try {
      const response = await UserService.getListUserRef({ userId });
      const data = response.data.data;
      return data;
    } catch (error) {
      throw error;
    }
  };

  const { data, error, isLoading, isError } = useQuery(
    [
      "get-list-user-ref",
      "admin",
      {
        userId,
      },
    ],
    () => getData()
  );
  useEffect(() => {
    if (isError) {
      throw new Error(error);
    }
  }, [isError]);

  return {
    data,
    isLoading,
    isError,
    error,
  };
};
export default useGetListUserRef;
