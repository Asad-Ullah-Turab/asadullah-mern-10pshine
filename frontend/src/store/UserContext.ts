import { createContext } from "react";
import type { IUser } from "../types/User";

interface IUserContext {
  user: IUser | null;
  loading: boolean;
  isAuthenticated: () => boolean;
}

const UserContext = createContext<IUserContext>({
  user: null,
  loading: true,
  isAuthenticated: () => false,
});

export default UserContext;
