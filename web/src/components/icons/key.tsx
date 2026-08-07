import { BaseIcon, Solid, type IconProps } from "./base-icon";

export function KeyIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <Solid d="M8 11a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
      <circle cx="8" cy="15.5" r="4.5" />
      <path d="M11.2 12.3L20 3.5" />
      <path d="M16 3.5h4.5V8" />
      <path d="M15 8.5l2 2" />
    </BaseIcon>
  );
}
