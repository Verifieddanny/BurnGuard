import { BaseIcon, Solid, type IconProps } from "./base-icon";

const BODY = "M12 2.4l7.4 3v5.3c0 4.7-3.2 8-7.4 9.3-4.2-1.3-7.4-4.6-7.4-9.3V5.4l7.4-3z";

export function ShieldIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <Solid d={BODY} />
      <path d={BODY} />
      <path d="M8.9 12.1l2.1 2.1 4.1-4.3" />
    </BaseIcon>
  );
}
