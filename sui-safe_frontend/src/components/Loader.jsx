const Loader = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backdropFilter: "blur(3px)",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div className="loader-ring" />
      <style>
        {`
          .loader-ring {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: conic-gradient(
              from 0deg,
              #7c3aed,
              #3b82f6,
              #a78bfa,
              #7c3aed
            );
            -webkit-mask: radial-gradient(farthest-side, transparent 80%, black 81%);
            mask: radial-gradient(farthest-side, transparent 80%, black 81%);
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Loader;
