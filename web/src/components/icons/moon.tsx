import { BaseIcon, Solid, type IconProps } from "./base-icon";

const CRESCENT = "M21 12.9A9 9 0 1111.1 3 7.2 7.2 0 0021 12.9z";

export function MoonIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <Solid d={CRESCENT} opacity={0.25} />
      <path d={CRESCENT} />
    </BaseIcon>
  );
}
