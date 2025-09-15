const Badge = ({ children, className = "", variant = "default", ...props }) => {
  return (
    <span
      className={`badge ${
        variant === "secondary" ? "badge--secondary" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
