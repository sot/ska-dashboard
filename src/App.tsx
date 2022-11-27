import React, { useState } from 'react';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';

import { TbSortAscending2, TbSortDescending2 } from "react-icons/tb";

import './App.css';

var semver = require('semver');

interface PullRequest {
  last_commit_date: string
  n_commits: number,
  number: number,
  title: string,
  url: string,
}

interface Merge {
  author: string,
  branch: string,
  pr_number: number,
  title: string,
}

interface Package {
  name: string,
  owner: string,
  updated_at: string
  master_version: string,
  flight: string,
  matlab: string,
  test_version: string,
  pull_requests: PullRequest[],
  merge_info: Merge[],
  n_pull_requests: number,
  merges: number,
  branches: number,
  issues: number,
  commits: number,
  pull_requests_item: any,
  merge_item: any,
  release_info: any,
  version: string,
}

interface PackageInfo {
  packages: Package[],
  "ska3-flight": string,
  "ska3-matlab": string,
  time: string,
}


function ColumnSelectorRow(props: any) {
  
  function onChange(event: any) {
    props.onChange(props.name, event.target.checked);
  }

  return (
    <div>
      <input
        type="checkbox"
        defaultChecked={props.checked}
        onChange={onChange}
      />
      {props.name}
    </div>
  )
}


interface ColumnSelectorProps {
  show: boolean,
  handleClose: any,
  result: any,
  columns: any,
}


class ColumnSelector extends React.Component<ColumnSelectorProps> {
  columns: any;

  constructor(props: ColumnSelectorProps) {
    super(props);
    this.columns = {...this.props.columns}
  }
  
  selected() {
    return Object.keys(Object.fromEntries(Object.entries(this.columns).filter(([k,v]) => v)));
  }
    
  toggleColumn(name: string, checked: boolean) {
    this.columns[name] = checked
  }

  save() {
    const selected = this.selected();
    this.props.result(selected)
    this.props.handleClose()
  }

  cancel() {
    this.props.handleClose()
  }

  render() {
    this.columns = {...this.props.columns}
    const all_columns = Object.keys(this.props.columns)

    return (
      <Modal show={this.props.show} onHide={this.cancel.bind(this)}>
        <Modal.Header closeButton>
          <Modal.Title>Select Columns</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {
            all_columns.map((column: string, i: number) => 
              <ColumnSelectorRow
                key={i} name={column} checked={this.props.columns[column]}
                onChange={this.toggleColumn.bind(this)}
              />
            )
          }
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.cancel.bind(this)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={this.save.bind(this)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }
}


interface FilterSelectorProps {
  show: boolean,
  handleClose: any,
  result: any,
  filters: any,
}

class FilterSelector extends React.Component<FilterSelectorProps> {
  filters: any;

  constructor(props: FilterSelectorProps) {
    super(props);
    this.filters = {...this.props.filters}
  }
  
  selected() {
    return Object.keys(Object.fromEntries(Object.entries(this.filters).filter(([k,v]) => v)));
  }
    
  toggleFilter(name: string, checked: boolean) {
    this.filters[name] = checked
  }

  onChange(event: any) {
    console.log(event)
  }

  save() {
    const selected = this.selected();
    this.props.result(selected)
    this.props.handleClose()
  }

  cancel() {
    this.props.handleClose()
  }

  render() {
    this.filters = {...this.props.filters}
    const all_filters = Object.keys(this.props.filters)

    return (
      <Modal show={this.props.show} onHide={this.cancel.bind(this)}>
        <Modal.Header closeButton>
          <Modal.Title>Select filters</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {
            all_filters.map((filter: string, i: number) => 
              <div key={i}>
                <input
                  type="checkbox"
                  defaultChecked={this.props.filters[filter]}
                  onChange={(event) => this.toggleFilter(filter, event.target.checked)}
                />
                {filter}
              </div>
            )
          }
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.cancel.bind(this)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={this.save.bind(this)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }
}


function lexicographic(a: any, b: any) {
  console.log('lexicographic sort', a, b)
  return a.toString().localeCompare(b.toString())
}


function numeric(a: number, b: number) {
  console.log('numeric sort', a, b)
  if (a === b) {
    return 0
  }
  return a - b
}


function version_sort(a: any, b: any) {
  var v1 = semver.clean(a)
  var v2 = semver.clean(b)
  if (v1 == null && v2 == null) {
    return 0
  }
  if (v2 == null) {
    return 1
  }
  if (v1 == null) {
    return -1
  }
  if (semver.gt(v1, v2)) {
    return 1
  }
  if (semver.lt(v1, v2)) {
    return -1
  }
  return 0
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


function PackageTable(props: any) {
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
      <Table bordered hover>
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
      </Table>
    </div>
  );
}


interface ColumnSpec {
  name: keyof Package,
  title?: string,
  show?: boolean,
  transform?: any,
  sort?: any,
  class?: any,
}


function Outdated(pkg: any) {
  return (
    pkg.release_info.length > 1
    && pkg.flight !== ""
    && pkg.release_info[1].release_tag !== pkg.flight
  )
}


function App() {
  const [package_info, setPackageInfo] = React.useState<PackageInfo>({
    packages: [],
    "ska3-flight": "",
    "ska3-matlab": "",
    time: "",
  });

  const url = 'https://cxc.cfa.harvard.edu/mta/ASPECT/skare3/dashboard/packages.json'
  const column_specs : { [key: string]: ColumnSpec } = {
    name: {
      name: "name",
      title: "Name",
      show: true,
      transform: ((
        (pkg: any) => <a href={"http://github.com/" + pkg["owner"] + "/" + pkg["name"]}> {pkg['name']}</a>
      )),
      sort: lexicographic,
      class: ((pkg: any) => (
        pkg.test_status === 'PASS'?
        'table-success':
        (
          pkg.test_status === 'FAIL'?
          'table-danger':
          'table-default')
      )),
    },
    owner: {
      name: "owner",
      title: "Organization",
    },
    updated_at: {
      name: "updated_at",
      title: "Last Updated",
    },
    master_version: {
      name: "master_version",
      title: "Master",
    },
    version: {
      name: "version",
      title: "Version",
      show: true,
      class: ((pkg: any) => (Outdated(pkg)? 'bg-info': 'table-default')),
      sort: version_sort,
    },
    flight: {
      name: "flight",
      title: "Flight",
      sort: version_sort,
    },
    matlab: {
      name: "matlab",
      title: "Matlab",
      sort: version_sort,
    },
    test_version: {
      name: "test_version",
      title: "Test",
      sort: version_sort,
    },
    pull_requests: {
      name: "pull_requests",
      title: "Pull Requests",
      transform: ((
        (pkg: any) => pkg["pull_requests"].map((pr: any, i: number) => <p key={i}> <a href={pr["url"]}> {pr['title']}</a> </p>)
      )),
      show: true,
    },
    merge_info: {
      name: "merges",
      title: "Merges",
      transform: ((
        (pkg: any) => pkg["merge_info"].map((pr: any, i: number) =>
        <p key={i}> {pr['title']} (<a href={"http://github.com/"+pkg["owner"]+"/"+pkg["name"]+"/pull/"+pr['pr_number']}>PR #{pr['pr_number']}</a>)
          </p>)
      )),
      show: true,
    },
    n_pull_requests: {
      name: "n_pull_requests",
      title: "PRs",
      sort: numeric,
    },
    merges: {
      name: "merges",
      title: "Merges",
      sort: numeric,
    },
    branches: {
      name: "branches",
      title: "Branches",
      sort: numeric,
    },
    issues: {
      name: "issues",
      title: "Issues",
      sort: numeric,
    },
    commits: {
      name: "commits",
      title: "Commits",
      sort: numeric,
    },
  }

  var default_columns = (
    Object.entries(column_specs).filter(([k, v]) => v.show === true).map((e) => e[0])
  )
  if (default_columns.length === 0) {
    default_columns = Object.keys(column_specs)
  }

  // this function fetches the file,
  // and then updates the package_info state value
  React.useEffect(function effectFunction() {
      fetch(url)
        .then(response => response.json())
        .then(package_info => {
            setPackageInfo(package_info);
        });
  }, []);

  // the columns shown are set by a separate dialog
  // which requires one callback to return the result
  // and two state variables
  // - one to show it or not
  // - one to hold the result of the dialog
  const [show_column_dialog, setShowColumnDialog] = useState(false)
  const [column_names, setColumnsState] = useState(default_columns);
  function setColumns(cols: string[]) {
    if (cols != null && cols.length > 0) {
      setColumnsState(cols)
    }
  }

  // the filters used are set using the same pattern as the columns
  const [show_filter_dialog, setShowFilterDialog] = useState(false)
  const [filter_names, setFiltersState] = useState<string[]>([]);
  function setFilters(filters: string[]) {
    if (filters != null) {
      setFiltersState(filters)
    }
  }

  // The following lines use the column_names
  // (which are the state value that results from the columns dialog)
  const columns = {
    ...Object.fromEntries(Object.keys(column_specs).map(x => [x, false])),
    ...Object.fromEntries(column_names.map(x => [x, true])),
  }

  // The following lines use the filter_names
  // (which are the state value that results from the filters dialog)
  const filters = {
    skare3: false,
    with_pr: false,
    with_merges: false,
    outdated: false,
    ...Object.fromEntries(filter_names.map(x => [x, true])),
  }
  const filter_functions : any = {
    skare3: ((p: any) => p["flight"] !== ""),
    with_pr: ((p: any) => p["pull_requests"].length > 0),
    with_merges: ((p: any) => p["merge_info"].length > 0),
    outdated: Outdated,
  }

  var packages = [...package_info.packages]

  for (var j in packages) {
    packages[j]['version'] = (
      packages[j].release_info.length > 1?
      packages[j].release_info[1].release_tag:
      ''
    )
  }

  for (var i = 0; i < filter_names.length; ++i) {
    packages = packages.filter(filter_functions[filter_names[i]]);
  }

  // console.log('package info', package_info)
  return (
    <div className="App">
      <h1> Ska Packages </h1>

      {package_info['time'].substring(0, 19)} <br/>
      <Button variant="light" onClick={() => setShowFilterDialog(true)}>
        Filters
      </Button>
      <Button variant="light" onClick={() => setShowColumnDialog(true)}>
        Columns
      </Button>

      <FilterSelector
        show={show_filter_dialog}
        handleClose={() => setShowFilterDialog(false)}
        result={setFilters}
        filters={filters}
      />

      <ColumnSelector
        show={show_column_dialog}
        handleClose={() => setShowColumnDialog(false)}
        result={setColumns}
        columns={columns}
      />

      <PackageTable
        data={packages}
        column_specs={column_specs}
        show_columns={column_names}
      />
    </div>
  );
}

export default App;
