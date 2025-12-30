const Checkbox = ({
  id,
  checked,
  onCheckedChange,
  className = "",
  ...props
}) => {
  return (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      className={`checkbox ${className}`}
      {...props}
    />
  );
};

export default Checkbox;
