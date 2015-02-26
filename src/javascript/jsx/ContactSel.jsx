var React = require('react');

var ContactSel = React.createClass({
  handleClick: function() {
    this.props.winAPI();
    console.log(this.props.contacts);
  },
  render: function() {
    return (
      <div>
        <div className="container paneContainer">
          <span className="stepLabel">Step 3 of 4</span>
          <h2 className="paneTitle">Who do you want to go with?</h2>
          <div className="paneContent">
            <button className="buttonAction" onClick={this.handleClick}>Choose a Friend</button>
            <div id="contactName">
              <span className="label">You are going with</span>
              <span className="value">{this.props.contacts}</span>
            </div>
          </div>
        </div>
        <div className="paneButtons">
        	<div className="container">
	        	<button className="buttonAction buttonConfirm" onClick={this.handleConfirm}>Confirm</button>
	        </div>
        </div>
        <div className="Friends background"></div>
      </div>
    );
  }
});

module.exports = ContactSel;