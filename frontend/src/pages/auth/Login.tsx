import { useForm, type SubmitHandler } from "react-hook-form";
import AuthButton from "./components/AuthButton";
import AuthWithGoogleBtn from "./components/AuthWithGoogleBtn";
import AuthWithGithubBtn from "./components/AuthWithGithubBtn";
import Logo from "../../components/ui/Logo";
import { LoginWithEmailPassword } from "../../api/auth";
import FormError from "./components/FormError";

interface IFormInput {
  email: string;
  password: string;
}

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();

  const handleLogin: SubmitHandler<IFormInput> = async ({
    email,
    password,
  }) => {
    await LoginWithEmailPassword(email, password);
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
        <form
          className="w-full flex flex-col gap-4"
          onSubmit={handleSubmit(handleLogin)}
        >
          <div>
            <input
              type="email"
              placeholder="Email"
              className="px-4 py-3 w-full rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              {...register("email", { required: "Email is required" })}
            />
            <FormError text={errors.email?.message} />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              className="px-4 py-3 w-full rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              {...register("password", { required: "Password is required" })}
            />
            <FormError text={errors.password?.message} />
          </div>
          <AuthButton className="mt-4" text="Login" />
        </form>
        <div className="flex items-center my-6 w-full">
          <div className="grow h-px bg-gray-300" />
          <span className="mx-3 text-gray-400 text-sm">or</span>
          <div className="grow h-px bg-gray-300" />
        </div>
        <div className="flex flex-col gap-3 w-full">
          <AuthWithGoogleBtn text="Login With Google" />
          <AuthWithGithubBtn text="Login With GitHub" />
        </div>
      </div>
    </div>
  );
}

export default Login;
