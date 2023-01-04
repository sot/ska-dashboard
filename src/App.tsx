import React, { useState } from 'react';

import Button from 'react-bootstrap/Button';
import ToggleButton from 'react-bootstrap/ToggleButton';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';

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

  onChange(group: string, filter: string[]) {
    // console.log(`${group}: ${filter}`)
    var res: { [key: string]: string[] } = {}
    res[group] = filter
    this.props.result(res)
  }

  render() {
    this.filters = {...this.props.filters}

    var defaults: {[key: string]: string[]} = {}
    for (const fg_key in this.filters) {
      const defa = Object.keys(this.filters[fg_key].filters).filter((k) => this.filters[fg_key].filters[k].active)
      defaults[fg_key] = defa
    }

    return (
      <>
        <ButtonToolbar className="justify-content-center" aria-label="Toolbar with button groups">
          {
            Object.keys(this.filters).map((fg_key, fg_idx) => (
              <ToggleButtonGroup
              key={fg_idx}
              className="me-3 gap-1"
              aria-label={`${fg_key} filter group`}
              name={fg_key}
              type="checkbox"
              defaultValue={defaults[fg_key]}
              onChange={(e: any) => (this.onChange(fg_key, e))}
              >
              {

                Object.keys(this.filters[fg_key].filters).map((f_key, f_idx) => (
                  <ToggleButton
                  variant="outline-dark"
                  size="sm"
                  key={f_idx}
                  id={`check-${fg_idx}-${f_idx}`}
                  defaultValue={[]}
                  value={f_key}
                  >
                    {this.filters[fg_key].filters[f_key].title}
                  </ToggleButton>
                  )
                )
              }
            </ToggleButtonGroup>
          ))}
        </ButtonToolbar>
      </>
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


function or_filters(pkg: any, functions: any) {
  if (functions.length === 0) {
    return true
  }
  return functions.map((f: any) => f(pkg))
    .reduce((acc: boolean, res: boolean) => (acc || res), false);
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
  const [filter_names, setFiltersState] = useState<{ [key: string]: string[] }>({});
  function setFilters(filters: { [key: string]: string[] }) {
    if (filters != null) {
      setFiltersState({...filter_names, ...filters})
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
  const filters: {[key: string]: {[key: string]: any}} = {
    skare3: {
      filters: {
        yes: {
          title: "Ska",
          active: false,
          function: ((p: any) => p["flight"] !== "")
        },
        no: {
          title: "non-Ska",
          active: false,
          function: ((p: any) => p["flight"] === "")
        },
      },
    },
    devel: {
      filters: {
        with_pr: {
          title: "With PRs",
          active: false,
          function: ((p: any) => p["pull_requests"].length > 0)
        },
        with_merges: {
          title: "With Merges",
          active: false,
          function: ((p: any) => p["merge_info"].length > 0)
        },
        outdated: {
          title: "With Releases",
          active: false,
          function: Outdated
        },
      }
    }
  }

  var packages = [...package_info.packages]

  for (var j in packages) {
    packages[j]['version'] = (
      packages[j].release_info.length > 1?
      packages[j].release_info[1].release_tag:
      ''
    )
  }
  
  const filter_keys = Object.keys(filter_names)
  for (var i = 0; i < filter_keys.length; ++i) {
    const fg_key = filter_keys[i]
    const filter_functions = filter_names[filter_keys[i]].map(
      (key: string) => filters[fg_key].filters[key].function
    )
    packages = packages.filter((pkg) => or_filters(pkg, filter_functions));
  }

  // console.log('package info', package_info)
  return (
    <div className="App">
      <h1> Ska Packages </h1>

      {package_info['time'].substring(0, 19)} <br/>
      <Button variant="outline-dark" size="sm" onClick={() => setShowColumnDialog(true)}>
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
