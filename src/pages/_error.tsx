import { NextPageContext } from "next";

function Error({ statusCode }: { statusCode?: number }) {
  return (
    <p>
      {statusCode
        ? `An error ${statusCode} occurred on server`
        : "An error occurred on client"}
    </p>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res
    ? res.statusCode
    : err && typeof (err as unknown) === "object" && err
    ? (err as unknown as { statusCode?: number }).statusCode ?? 404
    : 404;
  return { statusCode };
};

export default Error;
