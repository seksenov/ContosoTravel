var React = require('react');

var LocationSel = React.createClass({
  handleClick: function(i) {
    this.props.onChosenCity(i);
  },
  render: function() {
    return (
      <div id="destContainer">
      {this.props.cities.map(function(city, i) {
        return (
          <div className={"dest " + city} onClick={this.handleClick.bind(this, i)} key={i}><div className="title">{city}</div></div>
        );
       }, this)}
      </div>
    );
  }
});

module.exports = LocationSel;
