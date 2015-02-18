var React = require('react');

var ContactSel = React.createClass({
  handleClick: function() {
    this.props.winAPIs();
  },
  render: function() {
    return (
      <div>
        <button onClick={this.handleClick} id="friendButton">Take a Friend</button>
        <div id="contactBg"></div>
      </div>
    );
  }
});

module.exports = ContactSel;
