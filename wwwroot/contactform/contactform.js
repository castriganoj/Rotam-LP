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
            DimmerView.init();

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

            Data.saveContact(contact)
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

        viewDimmed: false,

        init: function () {
            this.section = $('#call-to-action');
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

                DimmerView.toggleDim(ContactView);

                Controller.saveContact(contact);

            });

            this.successMessage.hide();
            this.failMessage.hide();

        },

        renderSuccessMessage: function () {
            this.successMessage.show();
            DimmerView.toggleDim(this);

        },

        renderFailMessage: function () {
            this.failMessage.show();
            DimmerView.toggleDim(this);

        },

        render: function () {
            this.successMessage.hide();
            this.renderFailMessage.hide();
            this.contactFormName.val = "";
            this.contactFormEmail.val = "";


        }
    };

    var InquiryView = {

        viewDimmed: false,

        init: function () {
            this.section=$('#contact');
            this.inquiryForm = $('form.inquiry');
            this.inquiryFormName = $('form.inquiry #name');
            this.inquiryFormEmail = $('form.inquiry #email');
            this.inquiryFormMessage = $('form.inquiry #message');
            this.successMessage = $('#contact .alert.alert-success');
            this.failMessage = $('#contact .alert.alert-warning')

            this.inquiryForm.submit(function (e) {
                e.preventDefault();

                var inquiry = Controller.getInquiry();

                inquiry.contact.name = InquiryView.inquiryFormName.val();
                inquiry.contact.email = InquiryView.inquiryFormEmail.val();
                inquiry.message = InquiryView.inquiryFormMessage.val();

                DimmerView.toggleDim(InquiryView);

                Controller.saveInquiry(inquiry);
            });

            InquiryView.render();

        },

        render: function () {
            this.successMessage.hide();
            this.failMessage.hide();
        },

        renderSuccessMessage: function () {
            DimmerView.toggleDim(this);
            this.successMessage.show();
        },

        renderFailMessage: function () {
            DimmerView.toggleDim(this);
            this.failMessage.show();
        }
    };

    var DimmerView = {
        
        init: function () {
            this.waitingModal = $('#loadingModal');
        },

        
        toggleDim: function (view) {
            if (view.viewDimmed == false) {
                view.section.prepend(DimmerView.waitingModal);
                DimmerView.waitingModal.show();
                view.viewDimmed = true;

            } else {
                DimmerView.waitingModal.hide();
                view.viewDimmed = false;
            }
        }

    }


    Controller.init();

});