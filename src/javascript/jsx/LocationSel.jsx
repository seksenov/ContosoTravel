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
  render: function() {
    return (
      <div id="destContainer">
        <div onClick={this.setDest1} className="dest barcelona" id="dest1"></div>
        <div onClick={this.setDest2} className="dest verisailles" id="dest2"></div>
        <div onClick={this.setDest3} className="dest redmond" id="dest3"></div>
        <div onClick={this.setDest4} className="dest barcelonazoo" id="dest4"></div>
      </div>
    );
  }
});

module.exports = LocationSel;
