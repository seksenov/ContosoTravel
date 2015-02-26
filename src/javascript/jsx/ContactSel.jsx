var React = require('react');

var ContactSel = React.createClass({
  handleClick: function() {
    this.props.winAPI();
    console.log(this.props.contacts);
  },
  handleConfirm: function() {
    this.props.advanceSlide(4);
  },
  render: function() {
    return (
      <div>
        <div className="contentContainer">
          <div className="promptText">Who do you want to go with?</div>
          <button className="largeButton action-button button-animate blue" onClick={this.handleClick}>Choose a Friend</button>
          <div id="contactName">{this.props.contacts}</div>
          <button className="confirmButton action-button button-animate blue" onClick={this.handleConfirm}>Confirm</button>
        </div>
        <div className="Friends background"></div>
      </div>
    );
  }
});

module.exports = ContactSel;
