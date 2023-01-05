import React from 'react';

import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';


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

export default FilterSelector;
