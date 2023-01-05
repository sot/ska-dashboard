import React from 'react';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';


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

export default ColumnSelector;
