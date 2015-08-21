var React = require('react');
var plugins = require('plugins');

var ConfirmationPage = React.createClass({
  handleToast: function() {
    plugins.showToast('Pack your bags for ' + this.props.city + '. Leaving on ' + this.props.dates.departure);
  },
  render: function() {
    return (
      <div>
        <div className="container paneContainer">
          <span className="stepLabel">Success</span>
          <h2 className="paneTitle">Enjoy your trip to {this.props.city}!</h2>
          <div className="paneContent">
            <p>
              <span className="label">From</span>
              <span className="largeText">{this.props.dates.departure}</span>
            </p>
            <p>
              <span className="label">Until</span>
              <span className="largeText">{this.props.dates.returning}</span>
            </p>
          </div>
        </div>
        <div className="paneButtons">
        	<div className="container">
            <button className="buttonAction buttonConfirm" tabIndex="7" onClick={this.handleToast}>Toast Notification</button>
	        </div>
        </div>
        <div className="background Airplane"></div>
      </div>
    );
  }
});

module.exports = ConfirmationPage;
