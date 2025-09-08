import SlideService from "@/services/admin/SlideService";
import { useEffect } from "react";
import { useQuery } from "react-query";
const useGetDetailedSlide = ({ id }) => {
  const getData = async () => {
    try {
      const response = await SlideService.getDetailedSlide({ id });
      const data = response.data.data;
      return data;
    } catch (error) {
      throw error;
    }
  };

  const { data, error, isLoading, isError, refetch } = useQuery(["get-detailed-slide", "admin", { id }], () =>
    getData()
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
    refetch,
  };
};
export default useGetDetailedSlide;
