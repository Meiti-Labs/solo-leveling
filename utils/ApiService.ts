import axios, {
    type AxiosRequestConfig,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
    AxiosError,
  } from "axios";
  import Cookies from "universal-cookie";
  import { toast } from "sonner";
import { IApiResponse } from "@/types/types";
  
  
 
  
  class ApiService {
    private static axiosInstance = axios.create({
      baseURL:  `${window.location.origin}/api`,
      headers: {
        "Content-Type": "application/json",
      },
    });
  
    private static getAuthToken(): string | null {
      const cookies = new Cookies();
      return cookies.get("token") || null;
    }
  
    public static async removeTokens() {
      const cookies = new Cookies();
      console.log("Removing tokens...");
      console.log(cookies.get("token"));
  
      await cookies.remove("token", { path: "/", domain: "" });
      cookies.set("tokenRemovedAt", Date.now().toString(), { path: "/" });
    }
  
    private static setAuthHeader(
      config: InternalAxiosRequestConfig
    ): InternalAxiosRequestConfig {
      const token = this.getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }
  
    static initializeInterceptors() {
      this.axiosInstance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => this.setAuthHeader(config),
        (error) => Promise.reject(error)
      );
    }
  
    /**
     * Processes a successful API response.
     */
    private static handleResponse<T>(
      response: AxiosResponse<IApiResponse<T>>
    ): IApiResponse<T> {
      const IApiResponse = response.data;
  
      if (IApiResponse.resultCode !== "Ok") {
        if (IApiResponse.errorMessage) {
          toast.error(IApiResponse.errorMessage);
        }
  
        if (IApiResponse.resultCode === "Forbidden") {
          this.removeTokens();
          if (!window.location.pathname.includes("/safezone/login")) {
            window.location.href = "/safezone/login";
          }
        }
  
        return {
          ...IApiResponse,
          success: false,
          data: null as T,
        };
      }
  
      if (IApiResponse.success && IApiResponse.messages?.length) {
        IApiResponse.messages.forEach((msg) => toast.success(msg));
      }
  
      return {
        ...IApiResponse,
        success: true,
        data: (IApiResponse.data ?? IApiResponse.payload) as T,
      };
    }
  
    /**
     * Processes API errors globally and prevents rejection
     */
    private static handleError<T>(
      error: AxiosError<IApiResponse<T>>
    ): IApiResponse<T> {
      if (error.response) {
        const IApiResponse = error.response.data;
  
        if (IApiResponse?.messages?.length) {
          IApiResponse.messages.forEach((msg) => toast.error(msg));
        }
  
        if (
          error.response.status === 401 ||
          IApiResponse?.resultCode === "Forbidden" ||
          error.response.status === 403
        ) {
          this.removeTokens();
          if (!window.location.pathname.includes("/safezone/login")) {
            window.location.href = "/safezone/login";
          }
        }
  
        return {
          ...IApiResponse,
          success: false,
          data: null as T,
        };
      }
  
      toast.error("An error occurred while connecting to server");
      return {
        resultCode: "Fail",
        success: false,
        errorMessage: error.message,
        data: null as T,
      };
    }
  
    /**
     * GET method
     */
    static get<T>(
      url: string,
      params?: Record<string, unknown>
    ): Promise<IApiResponse<T>> {
      return this.axiosInstance
        .get<IApiResponse<T>>(url, { params })
        .then((response) => this.handleResponse<T>(response))
        .catch((error: AxiosError<IApiResponse<T>>) =>
          Promise.resolve(this.handleError<T>(error))
        );
    }
  
    /**
     * POST method
     */
    static post<T>(
      url: string,
      data: unknown,
      config: AxiosRequestConfig = {}
    ): Promise<IApiResponse<T>> {
      return this.axiosInstance
        .post<IApiResponse<T>>(url, data, config)
        .then((response) => this.handleResponse<T>(response))
        .catch((error: AxiosError<IApiResponse<T>>) =>
          Promise.resolve(this.handleError<T>(error))
        );
    }
  
    /**
     * PUT method
     */
    static put<T>(
      url: string,
      data?: unknown,
      config: AxiosRequestConfig = {}
    ): Promise<IApiResponse<T>> {
      return this.axiosInstance
        .put<IApiResponse<T>>(url, data, config)
        .then((response) => this.handleResponse<T>(response))
        .catch((error: AxiosError<IApiResponse<T>>) =>
          Promise.resolve(this.handleError<T>(error))
        );
    }
  
    /**
     * DELETE method
     */
    static delete<T>(
      url: string,
      config: AxiosRequestConfig = {}
    ): Promise<IApiResponse<T>> {
      return this.axiosInstance
        .delete<IApiResponse<T>>(url, config)
        .then((response) => this.handleResponse<T>(response))
        .catch((error: AxiosError<IApiResponse<T>>) =>
          Promise.resolve(this.handleError<T>(error))
        );
    }
  }
  
  // Initialize interceptors once
  ApiService.initializeInterceptors();
  
  export default ApiService;