import React from "react";

interface IconBellProps {
  active?: boolean;
  className?: string;
  size?: number | string;
}

/**
 * IconBell - a compact bell icon used as a theme toggle control.
 * Returns only the SVG icon, not a button - parent should handle button wrapper.
 */
const IconBell: React.FC<IconBellProps> = ({
  active = false,
  className = "",
  size = 20,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke={active ? "none" : "currentColor"}
      strokeWidth={active ? "0" : "1.5"}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-bell ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {active ? (
        <path d="M12 2C10.343 2 9 3.343 9 5v1.07A6.002 6.002 0 006 12v4l-1 1v1h14v-1l-1-1v-4a6 6 0 00-3-5.93V5c0-1.657-1.343-3-3-3zM8.5 20a3.5 3.5 0 006.999.001L8.5 20z" />
      ) : (
        <g>
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h11z" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </g>
      )}
    </svg>
  );
};

export default IconBell;
