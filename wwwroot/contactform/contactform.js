jQuery(document).ready(function($) {
  "use strict";

  //submit contact info
    var contactForm = $('form.contactInfo');
    var contactMessageForm = $('form.contactForm');
    var contact = {};

    contactForm.submit(function (e) {
        e.preventDefault();
        contact.Name = $(this).find('#Name').val();
        contact.Email = $(this).find('#Email').val();

    $.ajax({
      type: "POST",
      url: "home/submitcontactinfo",
      data: JSON.stringify(contact),
      contentType: "application/json; charset=utf-8",
      dataType:'json',
      success: function(msg) {
        // alert(msg);
        if (msg == 'OK') {
          $("#sendmessage").addClass("show");
          $("#errormessage").removeClass("show");
          contactForm.find("input").val("");
        } else {
          $("#sendmessage").removeClass("show");
          $("#errormessage").addClass("show");
          $('#errormessage').html(msg);
        }

      }
    });
    return false;
  });

});
