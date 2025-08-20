import { FaStar } from "react-icons/fa";
import { BiSolidHide } from "react-icons/bi";
import { FaFlag } from "react-icons/fa6";
import { IoStatsChart } from "react-icons/io5";

export default function reviews() {
  const links = [
    {
      name: "All",
    },
    {
      name: "Flagged",
    },
    {
      name: "Hidden",
    },
    {
      name: "Approved",
    },
  ];
  const userInfo = [
    {
      name: "Ibrahim Suleiman",
      date: "2025-02-15",
      rating: "4.0",
      comment: "Good finishing, but delayed delivery|",
    },
    {
      name: "Grace Mercy",
      date: "2024-12-25",
      rating: "3.5",
      comment: "Okay experience -- not the best, not the worst|",
    },
    {
      name: "Purity Emmanuel",
      date: "2025-09-11",
      rating: "4.2",
      comment: "No issues at all but|",
    },
    {
      name: "Xwan Chu Young",
      date: "2024-05-20",
      rating: "1.5",
      comment: "Terrible and frustrating customer exp|",
    },
    {
      name: "Partial Monday T.",
      date: "2025-01-17",
      rating: "4.5",
      comment: "I like how they always|",
    },
  ];
  return (
    <div>
      <h1 className="text-4xl text-[#101820] mb-2 mt-10 font-bold w-full">
        Community Reviews
      </h1>
      <p className="text-xl font-semibold text-[#101820]">Moderation Panel</p>
      <nav className="flex gap-x-10 my-10 text-xl text-[#101820] font-semibold">
        {links.map((link) => {
          return <a key={link.name}>{link.name}</a>;
        })}
      </nav>
      <div>
        <div className="grid grid-cols-9 gap-x-10 w-full mb-5 text-xl text-[#101820] font-semibold">
          <div className="col-span-2">USER</div>
          <div className="col-span-1">DATE</div>
          <div className="col-span-1">RATING</div>
          <div className="col-span-3">COMMENT</div>
          <div className="col-span-2 text-center">ACTIONS</div>
        </div>
        {userInfo.map((info) => {
          return (
            <div
              key={info.rating}
              className="grid  grid-cols-9 gap-x-10 w-full mb-10"
            >
              <div className="border-solid border-1 border-[#4ea8a1] p-3 rounded-lg col-span-2">
                {info.name}
              </div>
              <div className="border-solid border-1 border-[#4ea8a1] p-3 rounded-lg col-span-1">
                {info.date}
              </div>
              <div className="text-center border-solid border-1 border-[#4ea8a1] p-3 rounded-lg col-span-1">
                <FaStar
                  size={20}
                  className="text-[#EBEA98] inline-block mb-1 mr-3"
                />
                {info.rating}
              </div>
              <div className="text-[#E5E5E5] border-solid border-1 border-[#4ea8a1] px-3 pt-3 rounded-lg col-span-3">
                {info.comment}
              </div>
              <div className=" p-3 col-span-2 flex items-center justify-between">
                <BiSolidHide
                  size={40}
                  className="text-[#4ea8a1] inline-block"
                />
                <FaFlag size={30} className="inline-block text-[#4ea8a1]" />
                <span>
                  <IoStatsChart
                    size={35}
                    className="text-[#4ea8a1] inline-block"
                  />
                  <IoStatsChart
                    size={38}
                    className="text-[#4ea8a1] inline-block"
                  />
                </span>
              </div>
            </div>
          );
        })}
        {/* <table>
          <thead>
            <tr className="flex gap-x-20">
              <th>USER</th>
              <th>DATE</th>
              <th>RATING</th>
              <th>COMMENT</th>
            </tr>
          </thead>
          <tbody>
            {userInfo.map((info) => {
              return (
                <tr key={info.rating}>
                  <td>{info.name}</td>
                  <td>{info.date}</td>
                  <td>{info.rating}</td>
                  <td>{info.comment}</td>
                </tr>
              );
            })}
          </tbody>
        </table> */}
        {/* {userInfo.map(info => {
            return(
                <h
            )
        })} */}
      </div>
    </div>
  );
}
