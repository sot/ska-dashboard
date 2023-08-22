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


function normalize_column_specs(column_specs: { [key: string]: ColumnSpec }) {
  const norm_column_specs : { [key: string]: ColumnSpec } = column_specs  
  for (const value of Object.values(norm_column_specs)) {
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
  return norm_column_specs
}


function Row(props: any) {
  const cells = props.show_columns.map((col: string, j: number) =>
    <td key={j} className={props.column_specs[col].class(props.data)}>
      {props.column_specs[col].transform(props.data)}
    </td>
  )
  var rows = (<tr>{cells}</tr>)
  return rows
}


function Rows(props: any) {

  var raw_data = props.data  // do I need to make a copy so I can edit it?
  if (props.sort.column != null) {
    raw_data = raw_data.sort(
      compare(props.sort.column, props.sort.reverse, props.column_specs[props.sort.column].sort)
    )
  }

  return (
    <>
      {raw_data.map((pkg: any, i: number) =>
      <Row key={i} column_specs={props.column_specs} data={pkg} show_columns={props.show_columns}/>)}
    </>
    )
}
  

function Table(props: any) {
  const [sort, setSort] = React.useState<any>({column: null, reverse: false})

  const column_specs = normalize_column_specs(props.column_specs)

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
      <BootstrapTable bordered hover className="text-start">
        <thead>
          <tr>
          {props.show_columns.map((col: string, j: number) => <th  key={j} onClick={(event) => setSortColumn(col, event)}>{column_specs[col].title}
          {col === sort.column? (sort.reverse? <TbSortAscending2/>: <TbSortDescending2/>): ""}
          </th>)}
          </tr>
        </thead>
        <tbody>
          <Rows
            data={props.data}
            column_specs={column_specs}
            show_columns={props.show_columns}
            sort={sort}
          />
        </tbody>
      </BootstrapTable>
    </div>
  );
}


export default Table;
