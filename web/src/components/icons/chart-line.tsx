import { BaseIcon, Solid, type IconProps } from "./base-icon";

export function ChartLineIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      {/* Filled area under the line */}
      <Solid d="M5 20l4-6 3.5 3L19 8v12z" opacity={0.18} />
      <path d="M4 4v16h16" />
      <path d="M5 15l4-5 3.5 3L19 6" fill="none" />
    </BaseIcon>
  );
}
