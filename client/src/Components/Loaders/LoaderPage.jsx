import Spinner from "react-loader-spinner";

const Loader = () => {
  return (
    <div className="loader-page">
      <Spinner
        visible={true}
        type="Oval"
        color="rgba(0, 0, 0, 0.388)"
        height={50}
        width={50}
      />
    </div>
  );
};

export default Loader;
