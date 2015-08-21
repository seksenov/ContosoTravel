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
      <div>
        <div className="container paneContainer">
          <span className="stepLabel">Step 1 of 4</span>
          <h2 className="paneTitle">Where do you want to go?</h2>
          <div className="paneContent">
            <div id="destContainer">
              {this.props.cities.map(function(city, i) {
              return (
                <div className={"dest " + city.replace(/\s+/g, '')} onClick={this.handleClick.bind(this, i)} key={i}>
                  <div className="destTitle">
                    <span className="buttonAction" tabIndex={i}>{city}</span>
                  </div>
                </div>
              );
              }, this)}
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = LocationSel;
