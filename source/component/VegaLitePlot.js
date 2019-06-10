import React from 'react';
import BaseVisualization from './BaseVisualization.js'
import {View as vegaView, parse as vegaParse} from 'vega'
import { compile as vlCompile } from 'vega-lite'

// should only have to worry about rendering
class VegaLitePlot extends BaseVisualization {
  constructor(props, ctx) {
    super(props, ctx);
    this.width = this.props.w * 150 || 150
    this.height = this.props.h * 150 || 150
    this.style = {width: this.width, height: this.height}
  }
  componentDidMount(){
    if (this.state.ready){
      let spec = JSON.parse(this.props.spec)
      if (this.props.allData){
        spec.data = {"values": this.state.baseData}
      } else {
        spec.data = {"values": this.state.filteredData}
      }
      spec.height = this.props.h*90 || 90
      spec.width = this.props.w*90 || 90
      // try to guess quant filter setup
      if (spec.selection && spec.selection.brush && spec.selection.brush.encodings && spec.selection.brush.encodings.length){
        var fields = []
        let candidate_state = {}
        var can_render_filter = true;
        for (var i=0; i<spec.selection.brush.encodings.length; i++){
          let new_field = spec.encoding[spec.selection.brush.encodings[i]].field;
          if (this.state.filter[new_field] && this.state.filter[new_field].less && this.state.filter[new_field].greater){
            candidate_state[spec.selection.brush.encodings[i]] = [this.state.filter[new_field].greater,this.state.filter[new_field].less]
          } else {
            can_render_filter = false;
          }
        }
        // set filter state
        if (can_render_filter){
          spec.selection.brush.init = candidate_state
        }
      }
      let vl_view = new vegaView(vegaParse(vlCompile(spec).spec))
      vl_view.initialize(document.querySelector("#" + this.id))
      vl_view.hover()
      if (spec.selection && spec.selection.brush){
        vl_view.addDataListener('brush_store', (t,e)=> {
          if (e.length > 0 && e[0].fields.length > 0){
            window.clearTimeout(this.lastEvent)
            this.lastEvent = window.setTimeout(x=>{
              var next_filter = {}
              for (var j=0; j<e[0].fields.length; j++){
                let g_val = Math.min(...e[0].values[j])
                let l_val = Math.max(...e[0].values[j])
                next_filter[e[0].fields[j].field] = {greater:g_val, less:l_val}
              }
              this.filterIn(next_filter)
            },this.bufferTime)
          }
        })
      }
      vl_view.run();
    }
  }
  componentDidUpdate(){
    if (this.state.ready){
      let spec = JSON.parse(this.props.spec)
      if (this.props.allData){
        spec.data = {"values": this.state.baseData}
      } else {
        spec.data = {"values": this.state.filteredData}
      }
      spec.height = this.props.h*100 || 100
      spec.width = this.props.w*100 || 100
      // try to guess quant filter setup
      if (spec.selection && spec.selection.brush && spec.selection.brush.encodings && spec.selection.brush.encodings.length){
        var fields = []
        let candidate_state = {}
        var can_render_filter = true;
        for (var i=0; i<spec.selection.brush.encodings.length; i++){
          let new_field = spec.encoding[spec.selection.brush.encodings[i]].field;
          if (this.state.globalFilter[new_field] && this.state.globalFilter[new_field].less && this.state.globalFilter[new_field].greater){
            candidate_state[spec.selection.brush.encodings[i]] = [this.state.globalFilter[new_field].greater,this.state.globalFilter[new_field].less]
          } else {
            can_render_filter = false;
          }
        }
        // set filter state
        if (can_render_filter){
          spec.selection.brush.init = candidate_state
        }
      }
      let vl_view = new vegaView(vegaParse(vlCompile(spec).spec))
      vl_view.initialize(document.querySelector("#" + this.id))
      vl_view.hover();
      if (spec.selection && spec.selection.brush){
        vl_view.addDataListener('brush_store', (t,e)=> {
          if (e.length > 0 && e[0].fields.length > 0){
            window.clearTimeout(this.lastEvent)
            this.lastEvent = window.setTimeout(x=>{
              var next_filter = {}
              for (var j=0; j<e[0].fields.length; j++){
                let g_val = Math.min(...e[0].values[j])
                let l_val = Math.max(...e[0].values[j])
                next_filter[e[0].fields[j].field] = {greater:g_val, less:l_val}
              }
              this.filterIn(next_filter)
            },this.bufferTime)
          }
        })
      }
      vl_view.run();
    }
  }
  render() {
    if(this.state.ready){
      return <div id={this.id} className="vis vega-vis" style={this.style}></div>
    } else {
      return <div id={this.id} style={this.style} className="vis-loading"><p>waiting...</p></div>
    }

  }
}

export default VegaLitePlot
