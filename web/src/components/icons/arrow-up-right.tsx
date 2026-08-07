import { BaseIcon, type IconProps } from "./base-icon";

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M7 17L17 7M8 7h9v9" />
    </BaseIcon>
  );
}
