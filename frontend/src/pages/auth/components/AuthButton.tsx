function AuthButton({ className, text }: { className?: string; text: string }) {
  return (
    <button
      type="submit"
      className={`${className} w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-900 cursor-pointer transition`}
    >
      {text}
    </button>
  );
}

export default AuthButton;
