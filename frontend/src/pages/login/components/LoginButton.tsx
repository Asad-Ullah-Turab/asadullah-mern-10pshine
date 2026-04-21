function LoginButton({ className, ...props }: { className?: string }) {
  return (
    <button
      type="submit"
      className={`${className} w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-900 cursor-pointer transition`}
      {...props}
    >
      Login
    </button>
  );
}

export default LoginButton;
