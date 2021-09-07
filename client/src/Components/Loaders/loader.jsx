import Spinner from "react-loader-spinner";

const Loader = () => {
  return (
    <div className="loader-page">
      <Spinner type="TailSpin" color="rgba(0, 0, 0, 0.788)" height={60} width={60} />
    </div>
  );
};

export default Loader;
