import React from "react";
import ReactPaginate from "react-paginate";

import classNames from "classnames/bind";
import styles from "./paginator.module.scss";

const cn = classNames.bind(styles);

type PaginatorType = {
  handlePageClick: (event: any) => void;
  pageCount: number;
};

function Paginator(props: PaginatorType) {
  return (
    <ReactPaginate
      className={cn("pagination")}
      pageClassName={cn("page")}
      previousClassName={cn("page", "previous")}
      nextClassName={cn("page", "next")}
      activeClassName={cn("selected")}
      disabledClassName={cn("disabled")}
      breakLabel="..."
      nextLabel=">"
      onPageChange={props.handlePageClick}
      pageRangeDisplayed={5}
      pageCount={props.pageCount}
      previousLabel="<"
    />
  );
}

export default Paginator;
