import "../globals.css";

export default function adminSignIn() {
  return (
    <div className="text-center bg-[#E5E5E5]  pt-7 py-20 mx-100 max-2xl:mx-70 max-xl:mx-50 max-lg:mx-30 max-lg:py-15 max-lg:pt-5 max-md:mx-20 max-sm:mx-7  mt-30 max-sm:mt-15 rounded-xl">
      <nav className="text-[#4ea8a1] font-bold text-4xl pb-10 pr-5 text-right max-md:text-2xl">
        Inda
      </nav>
      <div className="px-65 max-2xl:px-50 max-xl:px-30 max-sm:px-10 text-center">
        <h1 className="text-[#4ea8a1] font-bold mb-5 text-4xl max-md:text-2xl">
          Welcome!
        </h1>
        <p className="#E5E5E5 pb-10 max-sm:text-xs">
          Please log into admin dashboard
        </p>
        <form>
          <input
            className="bg-[#4ea8a1] block text-[#f9f9f9] p-5 w-full rounded-lg mb-10 max-lg:mb-7"
            placeholder="Email"
          />
          <input
            className="border-[#4ea8a1] border-solid border-2 block p-5 w-full rounded-lg"
            placeholder="Password"
          />
          <button
            className="bg-[#4ea8a1] text-[#f9f9f9] w-75 max-2xl:w-50 max-sm:w-full rounded-lg p-3 my-10"
            type="button"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}
