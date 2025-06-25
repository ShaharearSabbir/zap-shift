import Marquee from "react-fast-marquee";
import amazon from "../../../assets/brands/amazon.png";
import vector from "../../../assets/brands/amazon_vector.png";
import cisco from "../../../assets/brands/casio.png";
import moonstar from "../../../assets/brands/moonstar.png";
import randstad from "../../../assets/brands/randstad.png";
import people from "../../../assets/brands/start-people 1.png";
import start from "../../../assets/brands/start.png";

const clientLogos = [amazon, vector, cisco, moonstar, randstad, people, start];

const TopClientsMarquee = () => {
  return (
    <section className="py-20">
      <h2 className="text-center text-2xl font-semibold mb-5">
        We've helped thousands of sales teams
      </h2>
      <Marquee pauseOnHover gradient={false} speed={50}>
        {clientLogos.map((logo, idx) => (
          <div key={idx} className="p-10 gap-24 flex items-center">
            <img
              src={logo}
              alt={`Client ${idx + 1}`}
              className="h-6 w-auto object-contain"
            />
          </div>
        ))}
      </Marquee>
    </section>
  );
};

export default TopClientsMarquee;
