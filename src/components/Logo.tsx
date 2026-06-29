import React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
  compact?: boolean;
}

export function Logo({ className = "", compact: _compact }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/img/logo-pekin.jpg"
        alt="Pekín S&A — Tu aliado en movimiento"
        width={248}
        height={100}
        priority
        className="object-contain"
      />
    </div>
  );
}

export function LogoWhite({ className = "", compact: _compact }: LogoProps) {
  return (
    <div className={`flex items-center py-2 ${className}`}>
      <Image
        src="/img/logo-pekin.jpg"
        alt="Pekín S&A — Tu aliado en movimiento"
        width={170}
        height={55}
        priority
        className="object-contain"
      />
    </div>
  );
}
