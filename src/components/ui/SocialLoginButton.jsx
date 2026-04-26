export default function SocialLoginButton({ icon, provider }) {
  return (
    <button className="w-full py-2 px-4 bg-transparent border border-outline-variant rounded-md text-on-surface font-body-md hover:bg-white/5 hover:border-outline transition-all flex items-center justify-center gap-4">
      {icon}
      {provider}
    </button>
  );
}
