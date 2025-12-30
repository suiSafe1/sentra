const Button = ({
  children,
  className = "",
  variant = "default",
  size = "default",
  ...props
}) => {
  return (
    <button
      className={`button ${variant === "ghost" ? "button--ghost" : ""} ${
        size === "lg" ? "button--lg" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
