import { BaseIcon, Solid, type IconProps } from "./base-icon";

export function SunIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <Solid d="M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" opacity={0.25} />
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 1.5v2.5M12 20v2.5M3.4 3.4l1.8 1.8M18.8 18.8l1.8 1.8M1.5 12H4M20 12h2.5M3.4 20.6l1.8-1.8M18.8 5.2l1.8-1.8" />
    </BaseIcon>
  );
}
