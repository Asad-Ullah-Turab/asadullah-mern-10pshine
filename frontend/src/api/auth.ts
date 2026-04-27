import config from "../config/config";

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

export { LoginWithEmailPassword };
