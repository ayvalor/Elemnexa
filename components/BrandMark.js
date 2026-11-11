import Image from "next/image";

/** Decorative generated mark; the adjacent wordmark supplies its name. */
export default function BrandMark({ className = "" }) {
  return <Image src="/elemnexa-mark.png" className={className} width={48} height={48} sizes="48px" alt="" aria-hidden="true" />;
}
