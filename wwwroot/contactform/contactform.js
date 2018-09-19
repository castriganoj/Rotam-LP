jQuery(document).ready(function ($) {
    "use strict";
    var alerts = $('.alert')
    //submit contact info
    var contactForm = $('form.contactInfo');
    var contactMessageForm = $('form.contactForm');
    
    var contact = {};

    alerts.hide();


    contactForm.submit(function (e) {
        e.preventDefault();
        contact.Name = $(this).find('#Name').val();
        contact.Email = $(this).find('#Email').val();

        $.ajax({
            type: "POST",
            url: "home/submitcontactinfo",
            data: JSON.stringify(contact),
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            success: function (msg) {
                var alertSuccess = $('#call-to-action .alert.alert-success');
                alertSuccess.show();
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {

                var alertWarning = $('#call-to-action .alert.alert-warning');

                alertWarning.show();
            }       
        });
        return false;
    });

});
