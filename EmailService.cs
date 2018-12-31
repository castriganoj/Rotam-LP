using Rotam_LP.Controllers;
using SendGrid;
using SendGrid.Helpers.Mail;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.IO;
using RazorLight;

namespace RotamLP
{
    public class EmailService : IEmail
    {

        private string MailKey;
        private string FromEmail;
        private string FromEmailName;
        private string WebRootPath;

        public EmailService(string webRootPath)
        {
            this.MailKey = System.Configuration.ConfigurationManager.AppSettings["emailKey"];
            this.FromEmail = System.Configuration.ConfigurationManager.AppSettings["fromEmailAddress"];
            this.FromEmailName = System.Configuration.ConfigurationManager.AppSettings["fromEmailName"];
            this.WebRootPath = webRootPath;
        }

        public async Task<Response> SendEmail(Contact contact, string messageType)
        {

             var model = new EmailModel()
            {
                Subject = "Thank you for signing up for Rotam",
                ToName = contact.Name,
                LineOne = GetLineOne(),
                LineTwo = GetLineTwo(),
                LineThree = GetLineThree(),
                Footer = GetFooter()
            };

            var htmlContent = await GetHtmlContent(contact, model);

            var client = new SendGridClient(MailKey);
            var from = new EmailAddress(FromEmail, FromEmailName);
            var subject = model.Subject;
            var to = new EmailAddress(contact.Email, contact.Name);
            var plainTextContent = GetLineTwo() + GetLineTwo() + GetLineThree() + GetFooter();
            var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
            return await client.SendEmailAsync(msg);
        }


        private async Task<string> GetHtmlContent(Contact contact, EmailModel emailModel)
        {
           
            var engine = new RazorLightEngineBuilder()
                        .UseMemoryCachingProvider()
                        .Build();

            var templateFolderPath = Path.Combine(WebRootPath, "EmailTemplates");

            var template = File.ReadAllText(templateFolderPath + @"/Onboarding.cshtml");

            string result = await engine.CompileRenderAsync("templatekey", template, emailModel);

            //            var cacheResult = engine.TemplateCache.RetrieveTemplate("templateKey");
            //if(cacheResult.Success)
            //{
            //    string result = await engine.RenderTemplateAsync(cacheResult.Template.TemplatePageFactory(), model);
            //}

            return result;

        }

        private string GetLineOne()
        {
            return
                @"Thanks for your interest in Rotam!";

        }

        private string GetLineTwo()
        {
            return
            @" Once the first prototype is complete you will receive an email with a link to test it out. Look for the email 3 to 6 weeks from now.";
        }

        private string GetLineThree()
        {
            return
            @"We do our best to create an app to help grow your bike shop and we rely on your feedback to make it great! Please send any feedback you have to jim @rotam.bike.
                    As the application is developed we will send out periodic notifications of the progress so you can view and try out the updates first hand. 
                    ";
        }

        private string GetFooter()
        {
            return
            @"P.S.I know you are super busy so I wanted to make sure you know that I do my best to make sure every email sent is valuable to you. If you ever want to unsubscribe just use the link in the bottom of this email.";

        }

    }



    public interface IEmail
    {
        Task<Response> SendEmail(Contact contact, string messageType);
    }

    public class EmailModel
    {
        public string Subject { get; set; }
        public string ToName { get; set; }

        public string LineOne { get; set; }

        public string LineTwo { get; set; }
        public string LineThree { get; set; }
        public string Footer { get; set; }
    }

}
