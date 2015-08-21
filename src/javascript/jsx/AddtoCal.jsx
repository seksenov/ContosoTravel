var React = require('react');

var AddtoCal = React.createClass({
  handleClick: function() {
    this.props.winAPI();
  },
  render: function() {
    return (
      <div>
        <div className="container paneContainer">
          <span className="stepLabel">Step 4 of 4</span>
          <h2 className="paneTitle">Add to System Calendar?</h2>
          <div className="paneContent">
            <button className="buttonAction" tabIndex="5" onClick={this.handleClick}>Add to Calendar</button>
          </div>
        </div>
        <div className="background Calendar"></div>
      </div>
    );
  }
});

module.exports = AddtoCal;
