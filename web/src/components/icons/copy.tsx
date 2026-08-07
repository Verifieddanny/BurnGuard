import { BaseIcon, Solid, type IconProps } from "./base-icon";

export function CopyIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <Solid d="M9 9h11a1 1 0 011 1v10a1 1 0 01-1 1H9a1 1 0 01-1-1V10a1 1 0 011-1z" />
      <rect x="8" y="9" width="13" height="13" rx="2" />
      <path d="M16 5.5V4a1 1 0 00-1-1H4a1 1 0 00-1 1v11a1 1 0 001 1h1.5" />
    </BaseIcon>
  );
}
