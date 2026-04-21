function Logo({ className }: { className?: string }) {
  return (
    <div className={`${className}`}>
      <img
        src="/assets/logo.png"
        alt="KeepIT Logo"
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export default Logo;
