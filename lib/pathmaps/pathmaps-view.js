'use babel'
/** @jsx etch.dom */

import etch from 'etch'
import UiComponent from '../ui/component'
import SelectList from '../ui/double-filter-list-view'
import Editor from '../ui/editor'
import fs from 'fs'

export default class PathMapsView extends UiComponent {

  constructor (props,children) {
    super(props,children)
  }

  render () {
    const {pathOptions,entry,state} = this.props;
    const settings = pathOptions
    return <div className='php-debug-overlay php-debug-pathmaps-view'>
      <span className="pathmaps-info">Setup a path map for this project</span>
      <div className='pathmaps-settings setting-paths'>
        <div className='pathmaps-settings-options'>
          <SelectList initialSelectionIndex={state.initialSelection} ref="selectList" firstLabel="Remote Path:" secondLabel="Local Path:" firstQuery={state.selected.remotePath} secondQuery={state.selected.localPath} didChangeQuery={this.didChangeQuery} didConfirmSelection={this.handleSelectElement} filterKeysForItem={this.getFilterKeys} elementForItem={this.getSettingElement} items={settings} />
        </div>
        <div className='pathmaps-settings-actions'>
          <div className="action-list">
            <button ref="saveButton" className="btn btn-save pathmaps-setting-save" onclick={this.handleSaveClick}>Save</button>
            <button ref="cancelButton" className="btn btn-cancel pathmaps-setting-cancel" onclick={this.handleCancelDetachClick}>Cancel and Detach</button>
          </div>
        </div>
      </div>
    </div>
  }

  getFilterKeys(item) {
    return {first:item.remotePath, second:item.localPath}
  }

  getSettingElement(item) {
    const li = document.createElement('li')
    const remoteSpan = document.createElement('span')
    const localSpan = document.createElement('span')
    const remoteLabel = document.createElement('span')
    const localLabel = document.createElement('span')
    const remoteDiv = document.createElement('div')
    const localDiv = document.createElement('div')
    remoteDiv.className = 'pathmap-path-container path-container remote-path-container'
    localDiv.className = 'pathmap-path-container path-container local-path-container'
    remoteSpan.className ='pathmap-path remote-path'
    remoteSpan.textContent = item.remotePath
    localSpan.textContent = item.localPath
    localSpan.className = 'pathmap-path local-path'

    remoteLabel.className ='pathmap-path-label remote-path-label'
    remoteLabel.textContent = "Remote Path:"
    localLabel.textContent = "Local Path:"
    localLabel.className = 'pathmap-path-label local-path-label'
    li.className ='pathmap-choice paths-container'
    remoteDiv.appendChild(remoteLabel)
    remoteDiv.appendChild(remoteSpan)
    localDiv.appendChild(localLabel)
    localDiv.appendChild(localSpan)
    li.appendChild(remoteDiv)
    li.appendChild(localDiv)

    return li
  }

  didChangeQuery() {
    if (!this.canSave()) {
      this.refs.saveButton.setAttribute("disabled","disabled")
    } else {
      this.refs.saveButton.removeAttribute("disabled")
    }
  }

  handleSelectElement(item) {
    const state = Object.assign({}, this.props.state);
    state.selected = item
    this.update({state:state});
  }

  canSave(selected) {
    if (!this.refs || !this.refs.selectList) {
      return false
    }
    const selectList = this.refs.selectList;

    const valueData = selectList.getQuery()
    if (valueData.first == "" || valueData.second == "") {
      if (selected == undefined || selected == null || selected.remotePath == "" || selected.localPath == "") {
        return false
      }
    }
    return true
  }

  handleSaveClick () {
    const selectList = this.refs.selectList;

    const valueData = selectList.getQuery()
    let pathMap = {remotePath:valueData.first, localPath:valueData.second}
    const onSave = this.props.onSave
    const selected = this.props.state.selected
    // Make sure the possible user entry *looks* valid if not
    // fall back to their last selection
    if (onSave != undefined && onSave != null) {
      fs.access(valueData.second,fs.constants.F_OK, (err) => {
        if (err == undefined || err == null) {
          onSave(pathMap, this.props.default)
        } else {
          onSave(selected, this.props.default)
        }
      });
    }
    this.destroy()
  }

  handleCancelDetachClick () {
    const onCancel = this.props.onCancel
    if (onCancel != undefined && onCancel != null) {
      onCancel()
    }
    this.destroy()
  }

  init () {
    if (!this.props.state) {
      this.props.state = {
        selected : {remotePath:"",localPath:""},
        canSave: false,
        initialSelection: null
      }
      if (this.props.default) {
        this.props.state.selected = this.props.default
        for (var idx in this.props.pathOptions) {
          if (this.props.pathOptions[idx].remotePath == this.props.default.remotePath && this.props.pathOptions[idx].localPath == this.props.default.localPath) {
            this.props.state.initialSelection = idx;
            break;
          }
        }
      }
    }
    super.init();
  }


  attach () {
    this.panel = atom.workspace.addModalPanel({item: this.element});
  }

  destroy() {
    super.destroy();
    if (this.panel != undefined && this.panel != null) {
      this.panel.destroy();
      delete this.panel
    }
  }


  handleCloseClick (event) {
    if (this.panel != undefined && this.panel != null) {
      this.panel.destroy();
      delete this.panel;
    }
  }

}
PathMapsView.bindFns = ["handleCloseClick","handleSaveClick","getSettingElement","handleSelectElement","didChangeQuery", "handleCancelDetachClick"]