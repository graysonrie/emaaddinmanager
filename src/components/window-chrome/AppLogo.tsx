import Image from "next/image";

export function AppLogo() {
  return (
    <div>
      <Image src="/images/ema2.png" alt="EMA Logo" width={32} height={32} />
    </div>
  );
}