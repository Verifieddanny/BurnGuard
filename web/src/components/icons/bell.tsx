import { BaseIcon, Solid, type IconProps } from "./base-icon";

const BODY =
  "M12 3a6.5 6.5 0 016.5 6.5c0 5.5 2.3 7.5 2.3 7.5H3.2s2.3-2 2.3-7.5A6.5 6.5 0 0112 3z";

export function BellIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <Solid d={BODY} />
      <path d={BODY} />
      <path d="M10 20.5a2 2 0 004 0" />
    </BaseIcon>
  );
}
