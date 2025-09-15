const Card = ({ children, className = "", title, description, ...props }) => {
  return (
    <div className={`card ${className}`} {...props}>
      {(title || description) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {description && <p className="card-description">{description}</p>}
        </div>
      )}
      <div className="card-content">{children}</div>
    </div>
  );
};

export default Card;
