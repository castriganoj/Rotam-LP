$(function () {


    var Data = {
        contact: {
            name: "",
            email: ""
        },

        inquiry: {
            contact: null,
            subject: "",
            message: ""

        },

        activeContact: null,

        activeInquiry: null,

        saveContact: function (contact) {

            return new Promise(function (resolve, reject) {
                $.ajax({
                    type: "POST",
                    url: "home/submitcontactinfo",
                    data: JSON.stringify(contact),
                    contentType: "application/json; charset=utf-8",
                    dataType: 'json',
                    success: function () {
                        return resolve(true);
                    },
                    error: function () {
                        return resolve(false);
                    }
                });
            });

        },

        saveInquiry: function (inquiry) {

            return new Promise(function (resolve, reject) {
                $.ajax({
                    type: "POST",
                    url: "home/submitinquiry",
                    data: JSON.stringify(inquiry),
                    contentType: "application/json; charset=utf-8",
                    dataType: 'json',
                    success: function () {
                        return resolve(true);
                    },
                    error: function () {
                        return resolve(false);
                    }
                });
            });

        }

    };

    var Controller = {

        init: function () {
            ContactView.init();
            InquiryView.init();

            Data.activeContact = Data.contact;
            Data.activeInquiry = Data.inquiry;

            Data.activeInquiry.contact = Data.contact;

        },

        getContact: function () {
            return Data.activeContact;
        },

        getInquiry: function () {
            return Data.activeInquiry;
        },

        saveContact: function (contact) {
            
            Data.saveEntity(contact)
                .then(function (contactSaved) {
                    if (contactSaved === true) {
                        ContactView.renderSuccessMessage();
                    } else {
                        ContactView.renderFailMessage();
                    }
                });


            Data.activeContact = null;


        },

        saveInquiry: function (inquiry) {
            Data.saveInquiry(inquiry)
                .then(function (inquirySaved) {
                    if (inquirySaved === true) {
                        InquiryView.renderSuccessMessage();
                    } else {
                        InquiryView.renderFailMessage();
                    }
                });
        }


    };

    var ContactView = {
        init: function () {
            this.contactForm = $('form.contactInfo');
            this.contactFormName = $('form.contactInfo #Name');
            this.contactFormEmail = $('form.contactInfo #Email');
            this.successMessage = $('#call-to-action .alert.alert-success');
            this.failMessage = $('#call-to-action .alert.alert-warning')


            this.contactForm.submit(function (e) {
                e.preventDefault();

                var contact = Controller.getContact();

                contact.name = ContactView.contactFormName.val();
                contact.email = ContactView.contactFormEmail.val();

                Controller.saveContact(contact);

            });

            this.successMessage.hide();
            this.failMessage.hide();

        },

        renderSuccessMessage: function () {
            this.successMessage.show();

        },

        renderFailMessage: function () {
            this.failMessage.show();

        },

        render: function () {
            this.successMessage.hide();
            this.renderFailMessage.hide();
            this.contactFormName.val = "";
            this.contactFormEmail.val = "";


        }
    };

    var InquiryView = {

        init: function () {
            this.inquiryForm = $('form.inquiry');
            this.inquiryFormName = $('form.inquiry #name');
            this.inquiryFormEmail = $('form.inquiry #email');
            this.inquiryFormMessage = $('form.inquiry #message');
            this.successMessage = $('#contact .alert.alert-success');
            this.failMessage = $('#contact .alert.alert-warning')

            this.inquiryForm.submit(function(e) {
                e.preventDefault();

                var inquiry = Controller.getInquiry();

                inquiry.contact.name = InquiryView.inquiryFormName.val();
                inquiry.contact.email = InquiryView.inquiryFormEmail.val();
                inquiry.message = InquiryView.inquiryFormMessage.val();

                Controller.saveInquiry(inquiry);
            });

            InquiryView.render();

        },

        render: function () {
            this.successMessage.hide();
            this.failMessage.hide();


        },

        renderSuccessMessage: function() {

            this.successMessage.show();
        },

        renderFailMessage: function() {
            this.failMessage.show();
        }
    };


    Controller.init();

});