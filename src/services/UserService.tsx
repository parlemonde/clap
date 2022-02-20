import type { AxiosRequestConfig } from "axios";
import { useRouter } from "next/router";
import React, { useState } from "react";

import { AxiosReturnType, axiosRequest } from "src/util/axiosRequest";
import { User } from "types/models/user.type";

type UserServiceFunc = Promise<{ success: boolean; errorCode: number }>;

interface UserServiceContextValue {
  user: User | null;
  isLoggedIn: boolean;
  login(username: string, password: string, remember: boolean): UserServiceFunc;
  loginWithSso(code: string): UserServiceFunc;
  axiosLoggedRequest(req: AxiosRequestConfig): Promise<AxiosReturnType>;
  signup(user: User, inviteCode?: string): UserServiceFunc;
  updatePassword(user: Partial<User>, verifyToken: string): UserServiceFunc;
  verifyEmail(user: Partial<User>): UserServiceFunc;
  logout(): Promise<void>;
  deleteAccount(): Promise<boolean>;
  setUser: (value: React.SetStateAction<User | null>) => void;
}

export const UserServiceContext = React.createContext<UserServiceContextValue>({
  user: null,
  isLoggedIn: false,
  login: () => Promise.resolve({ success: false, errorCode: 0 }),
  loginWithSso: () => Promise.resolve({ success: false, errorCode: 0 }),
  axiosLoggedRequest: () => Promise.resolve({ data: null, error: true, status: 404 }),
  signup: () => Promise.resolve({ success: false, errorCode: 0 }),
  updatePassword: () => Promise.resolve({ success: false, errorCode: 0 }),
  verifyEmail: () => Promise.resolve({ success: false, errorCode: 0 }),
  logout: () => Promise.resolve(),
  deleteAccount: () => Promise.resolve(false),
  setUser: () => {},
});

interface UserServiceProviderProps {
  user: User | null;
  csrfToken: string;
  children: React.ReactNode;
}

export const UserServiceProvider: React.FunctionComponent<UserServiceProviderProps> = ({
  user: initialUser,
  csrfToken,
  children,
}: UserServiceProviderProps) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const router = useRouter();
  const headers = React.useMemo(
    () => ({
      "csrf-token": csrfToken,
    }),
    [csrfToken],
  );

  /**
   * Login the user with username and password.
   * Return a number 0 -> success or not.
   * @param username
   * @param password
   * @param remember
   * @returns {Promise<{success: boolean, errorCode: number}>}
   */
  const login = async (username: string, password: string, remember: boolean = false): Promise<{ success: boolean; errorCode: number }> => {
    const response = await axiosRequest({
      method: "POST",
      url: "/login",
      headers,
      data: {
        username,
        password,
        getRefreshToken: remember,
      },
    });
    if (response.error) {
      return {
        success: false,
        errorCode: response.data.errorCode || 0,
      };
    }

    setUser(response.data.user || null);
    return {
      success: true,
      errorCode: 0,
    };
  };

  const loginWithSso = async (code: string): Promise<{ success: boolean; errorCode: number }> => {
    const response = await axiosRequest({
      method: "POST",
      url: "/login-sso-plm",
      headers,
      data: {
        code,
      },
    });
    if (response.error) {
      return {
        success: false,
        errorCode: response.data?.errorCode || 0,
      };
    }
    setUser(response.data.user || null);
    return {
      success: true,
      errorCode: 0,
    };
  };

  const logout = async (): Promise<void> => {
    // reject access token and server will delete cookies
    await axiosRequest({
      method: "POST",
      headers,
      url: "/logout",
      // withCredentials: true,
    });
    setUser(null);
    router.push("/create");
  };

  const deleteAccount = async (): Promise<boolean> => {
    if (user === null) {
      return false;
    }
    const response = await axiosRequest({
      method: "DELETE",
      headers,
      url: `users/${user.id}`,
    });
    if (response.error) {
      return false;
    }
    setUser(null);
    router.push("/create");
    return true;
  };

  /**
   * Signup the user.
   * Return a number 0 -> success or not.
   * @param user
   * @returns {Promise<{success: boolean, errorCode: number}>}
   */
  const signup = async (user: User, inviteCode?: string): Promise<{ success: boolean; errorCode: number }> => {
    const response = await axiosRequest({
      method: "POST",
      headers,
      url: "/users",
      data: {
        inviteCode,
        ...user,
      },
    });
    if (response.error) {
      return {
        success: false,
        errorCode: response.data.errorCode || 0,
      };
    }
    setUser(response.data.user || null);
    return {
      success: true,
      errorCode: 0,
    };
  };

  /**
   * Updates the user password.
   * Return a number 0 -> success or not.
   * @param user
   * @returns {Promise<{success: boolean, errorCode: number}>}
   */
  const updatePassword = async (user: Partial<User>, verifyToken: string): Promise<{ success: boolean; errorCode: number }> => {
    const response = await axiosRequest({
      method: "POST",
      headers,
      url: "/login/update-password",
      data: {
        email: user.email,
        verifyToken,
        password: user.password,
      },
    });
    if (response.error) {
      return {
        success: false,
        errorCode: response.data.errorCode || 0,
      };
    }
    setUser(response.data.user || null);
    return {
      success: true,
      errorCode: 0,
    };
  };

  /**
   * Verifies the user email.
   * Return a number 0 -> success or not.
   * @param user
   * @returns {Promise<{success: boolean, errorCode: number}>}
   */
  const verifyEmail = async (user: Partial<User>): Promise<{ success: boolean; errorCode: number }> => {
    const response = await axiosRequest({
      method: "POST",
      headers,
      url: "/login/verify-email",
      data: {
        ...user,
      },
    });
    if (response.error) {
      return {
        success: false,
        errorCode: response.data.errorCode || 0,
      };
    }
    setUser(response.data.user || null);
    return {
      success: true,
      errorCode: 0,
    };
  };

  // const logoutSessionExpired = async () => {
  //   // TODO;
  // };

  /**
   * Do an Axios logged request to the backend with the csrf token.
   * @param req
   * @returns {Promise<{data, pending, error, complete}>}
   */
  const axiosLoggedRequest = React.useCallback(
    async (req: AxiosRequestConfig): Promise<AxiosReturnType> => {
      const response = await axiosRequest({
        ...req,
        headers,
      });
      // if (response.error) ...
      return response;
    },
    [headers],
  );

  const isLoggedIn = user !== null;

  return (
    <UserServiceContext.Provider
      value={{
        user,
        isLoggedIn,
        login,
        loginWithSso,
        axiosLoggedRequest,
        signup,
        updatePassword,
        verifyEmail,
        logout,
        deleteAccount,
        setUser,
      }}
    >
      {children}
    </UserServiceContext.Provider>
  );
};
