function Error({ error }: { error?: string }) {
  return <>{error && <p className="text-red-400 text-sm ml-2">{error}</p>}</>;
}

export default Error;
