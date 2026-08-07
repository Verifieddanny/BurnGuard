import { BaseIcon, Solid, type IconProps } from "./base-icon";

export function SettingsIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <Solid d="M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" opacity={0.25} />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M19.4 4.6L17.3 6.7M6.7 17.3L4.6 19.4" />
    </BaseIcon>
  );
}
