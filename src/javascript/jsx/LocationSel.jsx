var React = require('react');

var LocationSel = React.createClass({
  handleClick: function(i) {
    this.props.onChosenCity(i);
  },
  handleRefresh: function() {
    window.location.reload(true);
  },
  render: function() {
    return (
      <div id="destContainer">
        <div onClick={this.handleRefresh} id="refreshButton">Refresh</div>
        {this.props.cities.map(function(city, i) {
          return (
            <div className={"dest " + city} onClick={this.handleClick.bind(this, i)} key={i}><div className="title">{city}</div></div>
          );
         }, this)}
        <div id="locationPrompt">Where do you want to go?</div>
      </div>
    );
  }
});

module.exports = LocationSel;
