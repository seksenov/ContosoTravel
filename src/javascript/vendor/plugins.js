var moment = require('moment');

exports.addAppointment = function(cb, date, loc) {
  if (typeof Windows !== 'undefined') {
    var appointment = new Windows.ApplicationModel.Appointments.Appointment();

    appointment.allDay = true;
    appointment.startTime = new Date(moment(date, 'dddd, Do MMM YYYY').format());
    appointment.subject = 'Trip to ' + loc;

    Windows.ApplicationModel.Appointments.AppointmentManager.showAddAppointmentAsync(appointment, { x: 300, y: 0, width: 600, height: 100 })
      .done(function (appointmentId) {
        if (appointmentId) {
          console.log('created!');
          cb();
        } else {
          console.log('issue');
        }
      });
  } else {
    cb();
  }
}
exports.addContact = function(cb) {
  console.log('plugin: addContact');
  if(typeof Windows !== 'undefined') {
    // Create the picker 
    var picker = new Windows.ApplicationModel.Contacts.ContactPicker(); 
    picker.desiredFieldsWithContactFieldType.append(Windows.ApplicationModel.Contacts.ContactFieldType.email);
    // Open the picker for the user to select a contact 
    picker.pickContactAsync().done(function (contact) { 
      if (contact !== null) { 
        var name = contact.displayName; 
        cb({'name': name}, null);
      } else { 
        // The picker was dismissed without selecting a contact 
        cb(null, "No contact was selected"); 
      } 
      
    });
  } else {
    console.log("ERROR: No Windows namespace was detected");  
    cb({'name': '[name]'}, null);
    //cb(null, "No Windows namespace was detected");
  }
}
exports.showToast = function(message) {
  // Log the message to the console
  console.log("OUTPUT: " + message);

  if(typeof Windows !== 'undefined') {
    // Log to the console
    var notifications = Windows.UI.Notifications;
    //Get the XML template where the notification content will be suplied
    var template = notifications.ToastTemplateType.toastImageAndText01;
    var toastXml = notifications.ToastNotificationManager.getTemplateContent(template);
    //Supply the text to the XML content
    var toastTextElements = toastXml.getElementsByTagName("text");
    toastTextElements[0].appendChild(toastXml.createTextNode(message));
    //Supply an image for the notification
    var toastImageElements = toastXml.getElementsByTagName("image");
    //Set the image this could be the background of the note, get the image from the web
    toastImageElements[0].setAttribute("src", "https://raw.githubusercontent.com/seksenov/ContosoTravel/master/build/images/storelogo.png");
    toastImageElements[0].setAttribute("alt", "red graphic");
    //Specify a long duration
    var toastNode = toastXml.selectSingleNode("/toast");
    toastNode.setAttribute("duration", "long");
    //Specify the audio for the toast notification
    var toastNode = toastXml.selectSingleNode("/toast");                        
    var audio = toastXml.createElement("audio");
    audio.setAttribute("src", "ms-winsoundevent:Notification.IM");
    //Specify launch paramater
    toastXml.selectSingleNode("/toast").setAttribute("launch", '{"type":"toast","param1":"12345","param2":"67890"}');
    //Create a toast notification based on the specified XML
    var toast = new notifications.ToastNotification(toastXml);
    //Send the toast notification
    var toastNotifier = notifications.ToastNotificationManager.createToastNotifier();
    toastNotifier.show(toast);

  } else {
    //TODO: Fallback to website functionality
    console.log("ERROR: No Windows namespace was detected");
  }

}
exports.cortanaHandler = function(args) {

  var activation = Windows.ApplicationModel.Activation;

  if (args.detail.kind === activation.ActivationKind.voiceCommand) {
    var speechRecognitionResult = args.detail.result;

    // The commandMode is either "voice" or "text", and it indicates how the voice command was entered by the user.
    // We should respect "text" mode by providing feedback in a silent form.
    var commandMode = semanticInterpretation("commandMode", speechRecognitionResult);

    // Get the name of the voice command, the actual text spoken, and the value of Command/Navigate@Target.
    var voiceCommandName = speechRecognitionResult.rulePath[0].toString();
    var textSpoken = speechRecognitionResult.text;
    var navigationTarget = semanticInterpretation("NavigationTarget", speechRecognitionResult);

    
  }

}
