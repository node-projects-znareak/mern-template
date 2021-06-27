import Spinner from "react-loader-spinner";

const Loader = () => {
  return (
    <div className="loader-page">
      <Spinner type="TailSpin" color="#eee" height={60} width={60} />
    </div>
  );
};

export default Loader;
