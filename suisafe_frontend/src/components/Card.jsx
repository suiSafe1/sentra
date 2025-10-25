import React from "react";

/**
 * A versatile Card component styled with Tailwind CSS.
 * It provides optional header slots for a title and description.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - The main content of the card.
 * @param {string} [props.className=""] - Additional classes for the main card container.
 * @param {string} [props.title] - Optional title for the card header.
 * @param {string} [props.description] - Optional description for the card header.
 * @returns {JSX.Element}
 */
const Card = ({ children, className = "", title, description, ...props }) => {
  return (
    <div
      // Base Card Styling: White background, rounded corners, subtle shadow, and padding
      className={`
        bg-white 
        rounded-xl 
        shadow-lg 
        overflow-hidden 
        ${className} 
      `}
      {...props}
    >
      {(title || description) && (
        <div
          // Card Header Styling: Padding at the bottom, border, and potentially different background
          className='bg-gray-50 p-6 border-gray-100 border-b'
        >
          {title && (
            <h3
              // Card Title Styling
              className='font-bold text-gray-900 text-xl'
            >
              {title}
            </h3>
          )}
          {description && (
            <p
              // Card Description Styling
              className='mt-1 text-gray-500 text-sm'
            >
              {description}
            </p>
          )}
        </div>
      )}

      {/* Card Content: Apply padding only if there is no title/description
          If a header exists, the content gets padding below the border. 
          If no header exists, the content needs top padding.
      */}
      <div className={title || description ? "p-6" : "p-6"}>{children}</div>
    </div>
  );
};

export default Card;
