var React = require('react');

var LocationSel = React.createClass({
  render: function() {
    return (
      <div id="destContainer">
        <div className="dest barcelona" id="dest1"></div>
        <div className="dest verisailles" id="dest2"></div>
        <div className="dest redmond" id="dest3"></div>
        <div className="dest barcelonazoo" id="dest4"></div>
      </div>
    );
  }
});

module.exports = LocationSel;
