import { redirect } from "react-router";
import config from "../config/config";

async function LoginWithEmailPassword(email: string, password: string) {
  try {
    await fetch(config.BACKEND_URL + "/auth/password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
  } catch (error) {
    console.error("Unexpected Error occured", error);
    redirect("/login?error=Unexpected%20Error%20Occured");
  }
}

export { LoginWithEmailPassword };
