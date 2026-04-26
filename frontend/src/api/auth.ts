import config from "../config/config";

async function LoginWithEmailPassword(email: string, password: string) {
  try {
    const response = await fetch(config.BACKEND_URL + "/auth/password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.success) {
      return {
        user: data.user,
      };
    } else {
      return {
        error: data.message || "Invalid credentials",
      };
    }
  } catch (error) {
    console.error("Login failed:", error);
    return {
      error: "An error occurred during login. Please try again.",
    };
  }
}

export { LoginWithEmailPassword };
