


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

        pageViewEvent: {
            element: any, 
            pageName:''
           
}}

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

        }, 

        savePageViewData: function (pageViewData) {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    type: "POST",
                    url: "home/sendInsightsEvent",
                    data: JSON.stringify(event),
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
            Event.init();

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
        }, 

        SendVirtualPageView: function (pageViewData) {
            let messageSent = Data.savePageViewData(pageViewData);

            if (!messageSent) {
                console.log('Virtual Page Event faild to save.');
            }
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
            this.section = $('#contact');
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


    var Event = {
        pages: [];
        init: function () {
            this.intro = document.getElementById("intro");
            this.features = document.getElementById('features');
            this.advancedFeatures = document.getElementById('advanced-features');
            this.callToAction = document.getElementById('call-to-action');
            this.progress = document.getElementById('progress');
            this.moreFeatures = document.getElementById('more-features');
            this.contact = document.getElementById('contact');

            Event.pages = [
                this.intro,
                this.features,
                this.advancedFeatures,
                this.callToAction,
                this.progress,
                this.progress,
                this.moreFeatures,
                this.contact
            ];

            Event.pages.forEach(page => ()
            {
                //create a pageViewEvent type for each page
                //map any pages that need it to the appropriate page view & edge cases for way points (i.e. offset). * features are benefits and advanced features are actually features. 
                //create a waypoint
                    //set element with element from pageView event
                    //set handler as virtual page view
                    // 

                new Waypoint({
                    element: page //will be page. pageHTMLElement and other property will be page view name. 
                    handler: function (direction) {
                        console.log('Scrolled to pageViewName!')
                    }
            })

            let introWayPoint = new Waypoint({
                element: document.getElementById("intro"),
                handler: function (direction) {
                    console.log('Scrolled to intro!')
                }
            });

            let benefitsWayPoint = new Waypoint({
                element: document.getElementById('features'),
                handler: function (direction) {
                    console.log('Scrolled to benefits!')
                }, 
                offset: '25%'
            });

            let advancedFeaturesWayPoint = new Waypoint({
                element: document.getElementById('advanced-features'),
                handler: function (direction) {
                    console.log('Scrolled to Advanced Features!')
                }, 
                offset: '25%'
            });

            let callToActionWayPoint = new Waypoint({
                element: document.getElementById('call-to-action'),
                handler: function (direction) {
                    console.log('Scrolled to call-to-action!')
                }, 
                offset: '50%'
            });

            let progressWayPoint = new Waypoint({
                element: document.getElementById('progress'),
                handler: function (direction) {
                    console.log('Scrolled to progress!')
                }, 
                offset: '25%'
            });

            let moreFeaturesFeaturesWayPoint = new Waypoint({
                element: document.getElementById('more-features'),
                handler: function (direction) {
                    console.log('Scrolled to moreFeatures!')
                }, 
                offset: '25%'
            });

            let progressFeaturesWayPoint = new Waypoint({
                element: document.getElementById('contact'),
                handler: function (direction) {
                    console.log('Scrolled to contact!')
                    Controller.SendVirtualPageView("contactPageView progress")
                }, 
                offset: '25%'
            });

        },



        
    }


    Controller.init();

});