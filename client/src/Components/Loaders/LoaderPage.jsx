import { Oval } from "react-loader-spinner";

const Loader = () => {
  return (
    <div className="loader-page"> 
      <Oval
        ariaLabel="Loading Page"
        visible={true}
        color="rgba(0, 0, 0, 0.388)"
        height={50}
        width={50}
      />
    </div>
  );
};

export default Loader;
