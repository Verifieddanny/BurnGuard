import { BaseIcon, type IconProps } from "./base-icon";

export function CloseIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M18 6L6 18M6 6l12 12" />
    </BaseIcon>
  );
}
