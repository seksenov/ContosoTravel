var React = require('react');
var plugins = require('plugins');

var ConfirmationPage = React.createClass({
  handleToast: function() {
    plugins.showToast('Pack your bags!');
  },
  render: function() {
    return (
      <div>
        <div className="contentContainer">
          <div className="largeText">Enjoy your trip to {this.props.city}!</div>
          <div className="largeText">From: {this.props.dates.departure}</div>
          <div className="largeText">Until: {this.props.dates.returning}</div>
          <button className="confirmButton action-button button-animate blue" onClick={this.handleToast}>Toast Notification</button>
        </div>
          <div className="background Airplane"></div>
      </div>
    );
  }
});

module.exports = ConfirmationPage;
