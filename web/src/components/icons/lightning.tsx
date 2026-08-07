import { BaseIcon, Solid, type IconProps } from "./base-icon";

const BOLT =
  "M13.2 2.3L4.6 13.1c-.4.5 0 1.1.5 1.1H10l-1 7.1c-.1.7.8 1 1.2.4l8.4-11c.4-.5 0-1.1-.6-1.1H14l1-6.9c.1-.7-.8-1-1.2-.4z";

export function LightningIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <Solid d={BOLT} opacity={0.22} />
      <path d={BOLT} />
    </BaseIcon>
  );
}
