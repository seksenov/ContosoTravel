var React = require('react');

var LocationSel = React.createClass({
  setDest1: function() {
    this.props.onChosenCity(0);
  },
  setDest2: function() {
    this.props.onChosenCity(1);
  },
  setDest3: function() {
    this.props.onChosenCity(2);
  },
  setDest4: function() {
    this.props.onChosenCity(3);
  },
  handleClick: function(i) {
    this.props.onChosenCity(i);
  },
  render: function() {
    return (
      <div id="destContainer">
      {this.props.cities.map(function(city, i) {
        return (
          <div className={"dest " + city} onClick={this.handleClick.bind(this, i)} key={i}></div>
        );
       }, this)}
      </div>
    );
  }
});

module.exports = LocationSel;
