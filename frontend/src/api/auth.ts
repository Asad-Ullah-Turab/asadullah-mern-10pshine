import config from "../config/config";
import type { IUser } from "../types/User";

async function LoginWithEmailPassword(email: string, password: string) {
  try {
    const response = await fetch(config.BACKEND_URL + "/auth/password", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      return {
        error: data.message || "Login failed",
      };
    }

    return { user: data.user };
  } catch (error) {
    console.error("Login failed:", error);
    return {
      error: "An error occurred during login. Please try again.",
    };
  }
}

async function GetLoggedInUser() {
  try {
    const response = await fetch(config.BACKEND_URL + "/auth/me", {
      method: "GET",
      credentials: "include",
    });
    const data = await response.json();
    if (response.ok) {
      return data.user;
    }
    return { error: data.message || "User not found" };
  } catch (error) {
    console.error("Failed to fetch logged in user:", error);
    return { error: "An error occurred while fetching user" };
  }
}

async function signUpWithEmailPassword(
  name: string,
  email: string,
  password: string,
) {
  try {
    const response = await fetch(config.BACKEND_URL + "/auth/signup", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      return {
        error: data.message || "Signup failed",
      };
    }
    return { user: data.user };
  } catch (error) {
    console.error("Signup failed:", error);
    return {
      error: "An error occurred during signup. Please try again.",
    };
  }
}

async function updateProfileName(name: string) {
  try {
    const response = await fetch(config.BACKEND_URL + "/auth/me", {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    if (!response.ok) {
      return {
        error: data.message || "Failed to update profile",
      };
    }
    return { user: data.user as IUser };
  } catch (error) {
    console.error("Profile update failed:", error);
    return {
      error: "An error occurred while updating your profile.",
    };
  }
}

async function logoutUser() {
  try {
    const response = await fetch(config.BACKEND_URL + "/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    const data = await response.json();
    if (!response.ok) {
      return {
        error: data.message || "Logout failed",
      };
    }
    return { message: data.message as string };
  } catch (error) {
    console.error("Logout failed:", error);
    return {
      error: "An error occurred while logging out.",
    };
  }
}

async function deleteAccount() {
  try {
    const response = await fetch(config.BACKEND_URL + "/auth/me", {
      method: "DELETE",
      credentials: "include",
    });
    const data = await response.json();
    if (!response.ok) {
      return {
        error: data.message || "Delete account failed",
      };
    }
    return { message: data.message as string };
  } catch (error) {
    console.error("Account deletion failed:", error);
    return {
      error: "An error occurred while deleting your account.",
    };
  }
}

export {
  LoginWithEmailPassword,
  GetLoggedInUser,
  signUpWithEmailPassword,
  updateProfileName,
  logoutUser,
  deleteAccount,
};
