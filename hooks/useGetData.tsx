import ApiService from "@/utils/ApiService";
import { useEffect, useState } from "react";

interface HookParams {
  url: string;
}

interface IUseGetData<T> {
  data: T | undefined;
  isLoading: boolean;
}

const useGetData = <T,>({ url }: HookParams): IUseGetData<T> => {
  const [data, setData] = useState<T | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  useEffect(() => {
    setIsLoading(true);
    ApiService.get<T>(url)
      .then((res) => res.resultCode == "Ok" && setData(res.data))
      .finally(() => {
        setIsLoading(false);
      });
  }, [url]);

  return { data, isLoading };
};

export default useGetData;
