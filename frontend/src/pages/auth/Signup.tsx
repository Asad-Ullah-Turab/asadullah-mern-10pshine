import { useForm, type SubmitHandler } from "react-hook-form";
import Logo from "../../components/ui/Logo";
import AuthButton from "./components/AuthButton";
import AuthWithGithubBtn from "./components/AuthWithGithubBtn";
import AuthWithGoogleBtn from "./components/AuthWithGoogleBtn";
import FormError from "./components/FormError";
import { signUpWithEmailPassword } from "../../api/auth";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router";
import UserContext from "../../store/UserContext";

interface IFormInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function Signup() {
  const [signUpError, setSignUpError] = useState<string>("");
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleSingup: SubmitHandler<IFormInput> = async ({
    name,
    email,
    password,
  }) => {
    const response = await signUpWithEmailPassword(name, email, password);
    if (response.error) {
      setSignUpError(response.error);
    } else {
      setSignUpError("");
      if (response.user) {
        setUser(response.user);
      }
      navigate("/");
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();

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
        <form
          className="w-full flex flex-col gap-4"
          onSubmit={handleSubmit(handleSingup)}
        >
          <div>
            <input
              type="text"
              placeholder="Name"
              className="px-4 py-3 w-full rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              {...register("name", {
                required: "Name is required",
              })}
            />
            <FormError text={errors.name?.message} />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email"
              className="px-4 py-3 w-full rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address",
                },
              })}
            />
            <FormError text={errors.email?.message} />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              className="px-4 py-3 w-full rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 10,
                  message: "Password must be at least 10 characters long",
                },
                maxLength: {
                  value: 20,
                  message: "Password must be less than 20 characters long",
                },
                pattern: {
                  value:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,20}$/,
                  message:
                    "Password must include an uppercase, a number, and special character",
                },
              })}
            />
            <FormError text={errors.password?.message} />
          </div>
          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              className="px-4 py-3 w-full rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              {...register("confirmPassword", {
                required: "Confirm Password is required",
                validate: {
                  matchesPassword: (value, { password }) =>
                    value === password || "Passwords do not match",
                },
              })}
            />
            <FormError text={errors.confirmPassword?.message} />
          </div>
          <FormError text={signUpError} />
          <AuthButton className="mt-4" text="Sign Up" />
        </form>
        <div className="flex items-center my-6 w-full">
          <div className="grow h-px bg-gray-300" />
          <span className="mx-3 text-gray-400 text-sm">or</span>
          <div className="grow h-px bg-gray-300" />
        </div>
        <div className="flex flex-col gap-3 w-full">
          <AuthWithGoogleBtn text="Signup With Google" />
          <AuthWithGithubBtn text="Signup With GitHub" />
        </div>

        <p className="mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
