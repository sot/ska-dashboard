import React, { useState } from 'react';

import Button from 'react-bootstrap/Button';

import {Package} from './package'
import Table, {ColumnSpec} from './table'
import ColumnSelector from './column_selector'
import FilterSelector from './filter_selector'
import {lexicographic_sort, numeric_sort, version_sort} from './utils/sorting'
import {or_filters, outdated} from './utils/filtering'


export interface PackageInfo {
  packages: Package[],
  "ska3-flight": string,
  "ska3-matlab": string,
  time: string,
}

function PackageDashboard() {

  const url = 'https://cxc.cfa.harvard.edu/mta/ASPECT/skare3/dashboard/packages.json'
  const column_specs : { [key: string]: ColumnSpec } = {
    name: {
      name: "name",
      title: "Name",
      show: true,
      transform: ((pkg: any) => 
        <a href={"http://github.com/" + pkg["owner"] + "/" + pkg["name"]}> {pkg['name']}</a>
      ),
      sort: lexicographic_sort,
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
      class: ((pkg: any) => (outdated(pkg)? 'bg-info': 'table-default')),
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
        (pkg: any) => (
          pkg["pull_requests"].map((pr: any, i: number) => 
            <p key={i}> PR #{pr['number']}:  <a href={pr["url"]}> {pr['title']}</a> </p>
          )
        )
      )),
      show: true,
    },
    merge_info: {
      name: "merges",
      title: "Merges",
      transform: ((pkg: any) =>
        pkg["merge_info"].map((pr: any, i: number) =>
          <p key={i}>
            PR #{pr['pr_number']}: <a
            href={"http://github.com/"+pkg["owner"]+"/"+pkg["name"]+"/pull/"+pr['pr_number']}>
              {pr['title']}
            </a>
          </p>
        )
      ),
      show: true,
    },
    n_pull_requests: {
      name: "n_pull_requests",
      title: "PRs",
      sort: numeric_sort,
    },
    merges: {
      name: "merges",
      title: "Merges",
      sort: numeric_sort,
    },
    branches: {
      name: "branches",
      title: "Branches",
      sort: numeric_sort,
    },
    issues: {
      name: "issues",
      title: "Issues",
      sort: numeric_sort,
    },
    commits: {
      name: "commits",
      title: "Commits",
      sort: numeric_sort,
    },
  }
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
          function: outdated
        },
      }
    }
  }

  // if no column has show == true, then show all columns
  var default_columns = (
    Object.entries(column_specs).filter(([k, v]) => v.show === true).map((e) => e[0])
  )
  if (default_columns.length === 0) {
    default_columns = Object.keys(column_specs)
  }

  const [package_info, setPackageInfo] = React.useState<PackageInfo>({
    packages: [],
    "ska3-flight": "",
    "ska3-matlab": "",
    time: "",
  });

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

  var packages = [...package_info.packages]

  for (var j in packages) {
    packages[j]['version'] = (
      packages[j].release_info.length > 1?
      packages[j].release_info[1].release_tag:
      ''
    )
  }
  
  // The following lines use the filter_names
  // (which are the state value that results from the filters dialog)
  const filter_keys = Object.keys(filter_names)
  for (var i = 0; i < filter_keys.length; ++i) {
    const fg_key = filter_keys[i]
    const filter_functions = filter_names[filter_keys[i]].map(
      (key: string) => filters[fg_key].filters[key].function
    )
    packages = packages.filter((pkg) => or_filters(pkg, filter_functions));
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

      <Table
        data={packages}
        column_specs={column_specs}
        show_columns={column_names}
      />
    </div>
  );
}

export default PackageDashboard;
