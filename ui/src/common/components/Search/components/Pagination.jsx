import React from "react";
import { Box, Link } from "@chakra-ui/react";

const PageLink = ({ pageNumber, fragmentName, setPage, isActive = false }) => {
  return (
    <Link
      onClick={(e) => {
        e.preventDefault();
        setPage(pageNumber - 1);
      }}
      href={`?${fragmentName}=${pageNumber}`}
      alt={`Page ${pageNumber}`}
      className={`${isActive ? "active" : ""}`}
    >
      {pageNumber}
    </Link>
  );
};

const PreviousLink = ({ currentPage, fragmentName, setPage }) => {
  return (
    <Link
      onClick={(e) => {
        e.preventDefault();
        setPage(Math.max(currentPage - 1, 0));
      }}
      href={`?${fragmentName}=${Math.max(currentPage - 1, 1)}`}
      rel={"prev"}
    >
      Précédent
    </Link>
  );
};

const NextLink = ({ currentPage, totalPages, fragmentName, setPage }) => {
  return (
    <Link
      onClick={(e) => {
        e.preventDefault();
        setPage(Math.min(currentPage + 1, totalPages - 1));
      }}
      href={`?${fragmentName}=${Math.min(currentPage + 1, totalPages)}`}
      rel={"next"}
    >
      Suivant
    </Link>
  );
};

export const Pagination = ({ totalPages, currentPage, setPage, fragmentName }) => {
  if (totalPages <= 1) {
    return <></>;
  }

  return (
    <Box className={"search-pagination"} textAlign={"center"} my={3} mx={1}>
      <PreviousLink fragmentName={fragmentName} setPage={setPage} currentPage={currentPage} />

      {currentPage > 1 && <PageLink pageNumber={1} setPage={setPage} fragmentName={fragmentName} />}

      {currentPage - 2 > 0 && <span>...</span>}

      {currentPage > 0 && <PageLink pageNumber={currentPage} setPage={setPage} fragmentName={fragmentName} />}

      <PageLink pageNumber={currentPage + 1} setPage={setPage} fragmentName={fragmentName} isActive={true} />

      {currentPage + 1 < totalPages - 1 && (
        <PageLink pageNumber={currentPage + 2} setPage={setPage} fragmentName={fragmentName} />
      )}

      {currentPage + 2 < totalPages - 1 && <span>...</span>}

      {currentPage < totalPages - 1 && (
        <PageLink pageNumber={totalPages} setPage={setPage} fragmentName={fragmentName} />
      )}

      <NextLink currentPage={currentPage} setPage={setPage} fragmentName={fragmentName} totalPages={totalPages} />
    </Box>
  );
};
