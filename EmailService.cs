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
        private RazorLightEngine RazorEngine;

        public EmailService(string webRootPath)
        {
            this.MailKey = System.Configuration.ConfigurationManager.AppSettings["emailKey"];
            this.FromEmail = System.Configuration.ConfigurationManager.AppSettings["fromEmailAddress"];
            this.FromEmailName = System.Configuration.ConfigurationManager.AppSettings["fromEmailName"];
            this.WebRootPath = webRootPath;
            this.RazorEngine = RazorEngineSingleton.GetRazorEngine();
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

            var result = "";
            var cacheResult = RazorEngine.TemplateCache.RetrieveTemplate("templatekey");
            if (cacheResult.Success)
            {
                 result = await RazorEngine.RenderTemplateAsync(cacheResult.Template.TemplatePageFactory(), emailModel);
            }
            else
            {
                var templateFolderPath = Path.Combine(WebRootPath, "EmailTemplates");

                var template = File.ReadAllText(templateFolderPath + @"/Onboarding.cshtml");

                result = await RazorEngine.CompileRenderAsync("templatekey", template, emailModel);

            }

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
            @" Once the first prototype is complete you will receive an email with a link to test it out. Look out for the email in the coming months.";
        }

        private string GetLineThree()
        {
            return
            @"We do our best to create an app to help grow your bike shop and we rely on your feedback to make it great! Please send any feedback you have to jim@rotam.bike.
                    As the application is developed we will send out periodic notifications of the progress so you can view and try out the updates first hand. 
                    ";
        }

        private string GetFooter()
        {
            return
            @"";
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

    public class RazorEngineSingleton
    {
        private RazorEngineSingleton()
        {
        }

        private static readonly RazorLightEngine Engine = new RazorLightEngineBuilder().UseMemoryCachingProvider().Build();

        public static RazorLightEngine GetRazorEngine()
        {
            return Engine;
        }
    }
}
