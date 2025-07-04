import logo from "../../../assets/logo.png";
import { Link } from "react-router";

const ProFastLogo = () => {
  return (
    <Link to="/">
      <div className="flex items-end">
        <img className="mb-2" src={logo} alt="" />
        <h3 className="text-3xl -ml-2 font-extrabold">ProFast</h3>
      </div>
    </Link>
  );
};

export default ProFastLogo;
