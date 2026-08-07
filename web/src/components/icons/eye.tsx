import { BaseIcon, Solid, type IconProps } from "./base-icon";

export function EyeIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <Solid d="M2 12s3.6-6.8 10-6.8S22 12 22 12s-3.6 6.8-10 6.8S2 12 2 12z" opacity={0.16} />
      <path d="M2 12s3.6-6.8 10-6.8S22 12 22 12s-3.6 6.8-10 6.8S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </BaseIcon>
  );
}
