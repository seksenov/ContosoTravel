var React = require('react');

var ContactSel = React.createClass({
  getInitialState: function() {
    return {showNames: false};
  },
  handleClick: function() {
    this.props.winAPI();
    console.log(this.props.contacts);
    this.setState({showNames: true});
  },
  handleConfirm: function() {
    this.props.advanceSlide(4);
  },
  render: function() {
    return (
      <div>
        <div className="container paneContainer">
          <span className="stepLabel">Step 3 of 4</span>
          <h2 className="paneTitle">Who do you want to go with?</h2>
          <div className="paneContent">
            <button className="buttonAction" onClick={this.handleClick}>Choose a Friend</button>
            { this.state.showNames ? 
              <div id="contactName">
                <span className="label">You are going with</span>
                <span className="value">{this.props.contacts}</span>
              </div>
              : null }
          </div>
        </div>
        <div className="paneButtons">
        	<div className="container">
	        	<button className="buttonAction buttonConfirm" tabIndex="6" onClick={this.handleConfirm}>Confirm</button>
	        </div>
        </div>
        <div className="Friends background"></div>
      </div>
    );
  }
});

module.exports = ContactSel;
