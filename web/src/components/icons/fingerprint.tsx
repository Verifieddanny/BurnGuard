import { BaseIcon, type IconProps } from "./base-icon";

export function FingerprintIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 10a8 8 0 0 1 13-2" />
      <path d="M4 15a10 10 0 0 1 .4-4" />
      <path d="M8 20a12 12 0 0 1-1-6 5 5 0 0 1 10 0c0 1 0 2 .3 3" />
      <path d="M12 14v2a6 6 0 0 0 1 3" />
      <path d="M12 11a3 3 0 0 1 3 3c0 2 0 3 .5 4" />
    </BaseIcon>
  );
}
