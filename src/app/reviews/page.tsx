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
        <div className="grid grid-cols-7 gap-x-10 w-full mb-5 text-xl text-[#101820] font-semibold">
          <div className="col-span-2">USER</div>
          <div className="col-span-1">DATE</div>
          <div className="col-span-1">RATING</div>
          <div className="col-span-3">COMMENT</div>
        </div>
        {userInfo.map((info) => {
          return (
            <div
              key={info.rating}
              className="grid  grid-cols-7 gap-x-10 w-full mb-10"
            >
              <div className="border-solid border-1 border-[#4ea8a1] p-3 rounded-lg col-span-2">
                {info.name}
              </div>
              <div className="border-solid border-1 border-[#4ea8a1] p-3 rounded-lg col-span-1">
                {info.date}
              </div>
              <div className="border-solid border-1 border-[#4ea8a1] p-3 rounded-lg col-span-1">
                {info.rating}
              </div>
              <div className="border-solid border-1 border-[#4ea8a1] p-3 rounded-lg col-span-3">
                {info.comment}
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
