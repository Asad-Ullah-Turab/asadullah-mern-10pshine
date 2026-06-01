import { createContext, type Dispatch, type SetStateAction } from "react";
import type { IUser } from "../types/User";

interface IUserContext {
  user: IUser | null;
  loading: boolean;
  isAuthenticated: () => boolean;
  setUser: Dispatch<SetStateAction<IUser | null>>;
}

const UserContext = createContext<IUserContext>({
  user: null,
  loading: true,
  isAuthenticated: () => false,
  setUser: () => undefined,
});

export default UserContext;
