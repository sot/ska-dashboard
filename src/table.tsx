import React from 'react';

import BootstrapTable from 'react-bootstrap/Table';

import { TbSortAscending2, TbSortDescending2 } from "react-icons/tb";

import {Package} from './package'


function lexicographic(a: any, b: any) {
  return a.toString().localeCompare(b.toString())
}


function compare(col: string, reverse: boolean, fcn: any) {
  function res(a: any, b: any) {
    if (a == null || b == null) {
      return undefined
    }
    if (a[col] == null || b[col] == null) {
      return undefined
    }
    const diff = fcn(a[col], b[col])
    if (reverse) {
      return -diff
    }
    return diff
  }
  return res
}




export interface ColumnSpec {
    name: keyof Package,
    title?: string,
    show?: boolean,
    transform?: any,
    sort?: any,
    class?: any,
}
  

function Table(props: any) {
  const [sort, setSort] = React.useState<any>({column: null, reverse: false})

  const column_specs : { [key: string]: ColumnSpec } = props.column_specs  
  for (const value of Object.values(column_specs)) {
    if (value.title == null) {
      value.title = value.name
    }
    if (value.sort == null) {
      value.sort = lexicographic
    }
    if (value.transform == null) {
      value.transform = ((pkg : Package) =>pkg[value.name])
    }
    if (value.class == null) {
      value.class = ((pkg : Package) => 'table-default')
    }
  }

  var raw_data = props.data  // do I need to make a copy so I can edit it?
  if (sort.column != null) {
    raw_data = raw_data.sort(compare(sort.column, sort.reverse, column_specs[sort.column].sort))
  }

  const data = raw_data.map((pkg: any) => (
    Object.fromEntries(Object.entries(column_specs).map(([k, v], i) =>
    [
      k,
      {
        value: v.transform(pkg),
        class: v.class(pkg),
      }
    ]))
  ))

  function setSortColumn(col: string, event: any) {
    if (col === sort.column) {
      setSort({column: col, reverse: !sort.reverse})
    }
    else {
      setSort({column: col, reverse: false})
    }
  }

  return (
    <div>
      <BootstrapTable bordered hover>
        <thead>
          <tr>
          {props.show_columns.map((col: string, j: number) => <th  key={j} onClick={(event) => setSortColumn(col, event)}>{column_specs[col].title}
          {col === sort.column? (sort.reverse? <TbSortAscending2/>: <TbSortDescending2/>): ""}
          </th>)}
          </tr>
        </thead>
        <tbody>
        {data.map((pkg: any, i: number) =>
          <tr key={i}>
            {
              props.show_columns.map((col: string, j: number) =>
              <td key={j} className={pkg[col].class}>{pkg[col].value}</td>)
            }
          </tr>)}
        </tbody>
      </BootstrapTable>
    </div>
  );
}


export default Table;
