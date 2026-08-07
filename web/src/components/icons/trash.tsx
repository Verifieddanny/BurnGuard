import { BaseIcon, Solid, type IconProps } from "./base-icon";

export function TrashIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <Solid d="M6 7h12l-1 13a1 1 0 01-1 1H8a1 1 0 01-1-1L6 7z" />
      <path d="M3 6.5h18M8.5 6.5V4.5a1 1 0 011-1h5a1 1 0 011 1v2" />
      <path d="M6 7l1 13.2a1 1 0 001 .9h8a1 1 0 001-.9L18 7" />
      <path d="M10 11v6M14 11v6" />
    </BaseIcon>
  );
}
