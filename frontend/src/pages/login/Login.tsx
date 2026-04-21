import React from "react";
import LoginButton from "./components/LoginButton";
import LoginWithGoogleBtn from "./components/LoginWithGoogleBtn";
import LoginWithGithubBtn from "./components/LoginWithGithubBtn";
import Logo from "../../components/ui/Logo";

function Login() {
  const handleLogin = (e: React.SyntheticEvent) => {
    e.preventDefault();
    // Implement login logic here
    console.log("Login form submitted");
  };
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80')",
      }}
    >
      <div className="bg-white bg-opacity-90 rounded-xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center">
        <Logo className="w-50 h-20 mb-12 -ml-5" />
        <form className="w-full flex flex-col gap-4" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="px-4 py-3 rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
          <input
            type="password"
            placeholder="Password"
            className="px-4 py-3 rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
          <LoginButton className="mt-4" />
        </form>
        <div className="flex items-center my-6 w-full">
          <div className="grow h-px bg-gray-300" />
          <span className="mx-3 text-gray-400 text-sm">or</span>
          <div className="grow h-px bg-gray-300" />
        </div>
        <div className="flex flex-col gap-3 w-full">
          <LoginWithGoogleBtn />
          <LoginWithGithubBtn />
        </div>
      </div>
    </div>
  );
}

export default Login;
