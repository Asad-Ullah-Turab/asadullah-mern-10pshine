function FormError({ text }: { text?: string }) {
  return <>{text && <p className="text-red-400 text-sm ml-2">{text}</p>}</>;
}

export default FormError;
