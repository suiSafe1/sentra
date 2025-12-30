import { useEffect, useRef } from "react";

const Dialog = ({ open, onOpenChange, children, className = "", ...props }) => {
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        onOpenChange?.(false); // Close the dialog if clicked outside
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className={`dialog-backdrop ${className}`} {...props}>
      <div className="dialog-wrapper" ref={wrapperRef}>
        {children}
      </div>
    </div>
  );
};

export default Dialog;
