var React = require('react');

var AddtoCal = React.createClass({
  handleClick: function() {
    this.props.winAPI();
  },
  render: function() {
    return (
      <div>
        <div className="contentContainer">
          <div className="promptText">Add to System Calendar?</div>
          <button className="largeButton action-button button-animate blue" onClick={this.handleClick} id="friendButton">Add to Calendar</button>
        </div>
        <div className="background Calendar"></div>
      </div>
    );
  }
});

module.exports = AddtoCal;
