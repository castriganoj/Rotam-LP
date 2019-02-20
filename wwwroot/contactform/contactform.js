


$(function() {

    let Data = {
        contact: {
            name: "",
            email: ""
        },

        inquiry: {
            contact: null,
            subject: "",
            message: ""

        },

        pageViewEvent: function(element, pageName) {
        this.element = element;
        this.pageName = pageName;
        },


        activeContact: null,

        activeInquiry: null,

        saveContact: function(contact) {
            
            gtag('event', 'SignUp');
            return new Promise(function(resolve, reject) {
                $.ajax({
                    type: "POST",
                    url: "home/submitcontactinfo",
                    data: JSON.stringify(contact),
                    contentType: "application/json; charset=utf-8",
                    dataType: 'json',
                    success: function() {
                        return resolve(true);
                    },
                    error: function() {
                        return resolve(false);
                    }
                });
            });

        },

        saveInquiry: function(inquiry) {

            gtag('event', 'SendInquiry');
            return new Promise(function(resolve, reject) {
                $.ajax({
                    type: "POST",
                    url: "home/submitinquiry",
                    data: JSON.stringify(inquiry),
                    contentType: "application/json; charset=utf-8",
                    dataType: 'json',
                    success: function() {
                        return resolve(true);
                    },
                    error: function() {
                        return resolve(false);
                    }
                });
            });

        },

        savePageViewData: function(pageViewData) {

            gtag('event', 'screen_view', { 'screen_name': pageViewData.pageName});

            // if ("ga" in window) {
            //     tracker = ga.getAll()[0];
            //     if (tracker)
            //         tracker.send('event', 'screen_view', {'screen_name': pageViewData.pageName});
            // }

            // return new Promise(function(resolve, reject) {
            //     $.ajax({
            //         type: "POST",
            //         url: "home/sendInsightsEvent",
            //         data: JSON.stringify(pageViewData),
            //         contentType: "application/json; charset=utf-8",
            //         dataType: 'json',
            //         success: function() {
            //             return resolve(true);
            //         },
            //         error: function() {
            //             return resolve(false);
            //         }
            //     });
            // });
        }

    };

    let Controller = {
        init: function() {
            ContactView.init();
            InquiryView.init();
            DimmerView.init();
            Event.init();

            Data.activeContact = Data.contact;
            Data.activeInquiry = Data.inquiry;

            Data.activeInquiry.contact = Data.contact;

        },

        getContact: function() {
            return Data.activeContact;
        },

        getInquiry: function() {
            return Data.activeInquiry;
        },

        saveContact: function(contact) {

            Data.saveContact(contact)
                .then(function(contactSaved) {
                    if (contactSaved === true) {
                        ContactView.renderSuccessMessage();
                    } else {
                        ContactView.renderFailMessage();
                    }
                });


            Data.activeContact = null;


        },

        saveInquiry: function(inquiry) {
            Data.saveInquiry(inquiry)
                .then(function(inquirySaved) {
                    if (inquirySaved === true) {
                        InquiryView.renderSuccessMessage();
                    } else {
                        InquiryView.renderFailMessage();
                    }
                });
        },

        SendVirtualPageView: function(pageViewElement) {

            let pageViewEvent =  new Data.pageViewEvent(pageViewElement, pageViewElement.id);

            Data.savePageViewData(pageViewEvent)
            
            let messageSent = true;
            if (!messageSent) {
                console.log('Virtual Page Event faild to save.');

            }
        }

    };

    let ContactView = {
        viewDimmed: false,

        init: function() {
            this.section = $('#call-to-action');
            this.contactForm = $('form.contactInfo');
            this.contactFormName = $('form.contactInfo #Name');
            this.contactFormEmail = $('form.contactInfo #Email');
            this.contactFormConfirmEmail = $('form.contactInfo #confirm-email');

            this.successMessage = $('#call-to-action .alert.alert-success');
            this.failMessage = $('#call-to-action .alert.alert-warning')

            this.contactFormConfirmEmail.on('input', function() {
                let confirmEmailElem = ContactView.contactFormConfirmEmail.get(0)
                if(ContactView.contactFormEmail.val() !== ContactView.contactFormConfirmEmail.val())
                {
                    confirmEmailElem.setCustomValidity('Emails do not match');
                }
                else
                {
                    confirmEmailElem.setCustomValidity('');
                }
            });
            
            this.contactForm.submit(function(e) {
                e.preventDefault();

                var contact = Controller.getContact();

                contact.name = ContactView.contactFormName.val();
                contact.email = ContactView.contactFormEmail.val();
                contact.confirmEmail = ContactView.contactFormConfirmEmail.val();

                if(contact.email !== contact.confirmEmail)
                {
                    ContactView.contactFormConfirmEmail.get(0)
                    .setCustomValidity("Passwords Don't Match");
                    throw 'emails do not match';
                    this.contactForm[0].reset();
                }


                DimmerView.toggleDim(ContactView);

                Controller.saveContact(contact);
                this.contactForm[0].reset()
            });

            this.successMessage.hide();
            this.failMessage.hide();

        },

        renderSuccessMessage: function() {
            this.successMessage.show();
            DimmerView.toggleDim(this);

        },

        renderFailMessage: function() {
            this.failMessage.show();
            DimmerView.toggleDim(this);

        },

        render: function() {
            this.successMessage.hide();
            this.renderFailMessage.hide();
            this.contactFormName.val = "";
            this.contactFormEmail.val = "";


        }

    };

    let InquiryView = {
        viewDimmed: false,

        init: function() {
            this.section = $('#contact');
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

                DimmerView.toggleDim(InquiryView);

                Controller.saveInquiry(inquiry);
            });

            InquiryView.render();

        },

        render: function() {
            this.successMessage.hide();
            this.failMessage.hide();
        },

        renderSuccessMessage: function() {
            DimmerView.toggleDim(this);
            this.successMessage.show();
        },

        renderFailMessage: function() {
            DimmerView.toggleDim(this);
            this.failMessage.show();
        }
    };

    let DimmerView = {
        init: function() {
            this.waitingModal = $('#loadingModal');
        },


        toggleDim: function(view) {
            if (view.viewDimmed == false) {
                view.section.prepend(DimmerView.waitingModal);
                DimmerView.waitingModal.show();
                view.viewDimmed = true;

            } else {
                DimmerView.waitingModal.hide();
                view.viewDimmed = false;
            }
        }

    };

    let Event = {
        pages: [],

        init: function() {
            this.intro = document.getElementById("intro");
            this.features = document.getElementById('features');
            this.advancedFeatures = document.getElementById('advanced-features');
            this.callToAction = document.getElementById('call-to-action');
            this.progress = document.getElementById('progress');
            this.moreFeatures = document.getElementById('more-features');
            this.contact = document.getElementById('contact');


            Event.pages = [
                Event.intro,
                Event.features,
                Event.advancedFeatures,
                Event.callToAction,
                Event.progress,
                Event.moreFeatures,
                Event.contact
            ];
            wayPoints = [];

            Event.pages.forEach( function(page) {
               let pageViewEvent =    new Data.pageViewEvent();
                pageViewEvent.pageName = page.id
                pageViewEvent.element = page            

                new Waypoint({
                    element: page,
                    handler: function (direction) {
                            console.log('Scrolled ' + this.element.id)
                            Controller.SendVirtualPageView(this.element);
                        
                    },
                    offset: '50%'
                });
            });

        }

    };

    Controller.init();
});
