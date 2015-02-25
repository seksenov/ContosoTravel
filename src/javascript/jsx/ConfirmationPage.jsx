var React = require('react');

var ConfirmationPage = React.createClass({
  render: function() {
    return (
      <div>
        <div className="contentContainer">
          <div className="centeredText">Success!</div>
          <button className="confirmButton action-button button-animate blue" onClick={this.handleConfirm}>Toast Notification</button>
        </div>
          <div className="background Airplane"></div>
      </div>
    );
  }
});

module.exports = ConfirmationPage;
