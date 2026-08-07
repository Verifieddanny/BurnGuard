import { BaseIcon, type IconProps } from "./base-icon";

export function MenuIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </BaseIcon>
  );
}
