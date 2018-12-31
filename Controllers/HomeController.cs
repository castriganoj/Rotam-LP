using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.AspNetCore.Extensions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Documents;
using Microsoft.Azure.Documents.Client;
using Microsoft.IdentityModel.Protocols;
using Newtonsoft.Json;
using Rotam_LP.Models;
using RotamLP;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace Rotam_LP.Controllers
{
    public class HomeController : Controller
    {

        private const string EndpointUri = "https://jc-personal2.documents.azure.com:443/";
        private const string PrimaryKey = "goXAev7OU8TUiTbRAVZxgfFubr3UVRStxP2v17UsvG82ZIpBvpI9R5UBR6D76vbGkIMFtRetPnxGgpNwUt47UA==";
        private DocumentClient documentClient;
        private TelemetryClient Telemetry;
        private IEmail EmailService; 

        public HomeController(TelemetryClient telemetry)
        {
            documentClient = GetDocumentDb();

            //ToDo: move to one time execution and startup
            documentClient.CreateDatabaseIfNotExistsAsync(new Database() { Id = "RotamLandingPage" });
            documentClient.CreateDocumentCollectionIfNotExistsAsync(UriFactory.CreateDatabaseUri("RotamLandingPage"), new DocumentCollection { Id = "ContactInfo" });
            this.Telemetry = telemetry;

            this.EmailService = new EmailService();
       
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> SubmitContactInfo([FromBody] Contact contact)
        {
            try
            {
                await CreateContactDocumentIfNotExists("RotamLandingPage", "ContactInfo", contact);

                var messageType = "onBoarding";

                await SendConfirmationEmailAsync(contact, messageType);

                return Ok(contact);
            }
            catch (Exception e)
            {
                Debug.WriteLine(e);
                return StatusCode(StatusCodes.Status500InternalServerError);
            }

        }

        [HttpPost]
        public async Task<IActionResult> SubmitInquiry([FromBody] Inquiry inquiry)
        {
            var confirmationMessage = "Thank you for your inquiry";
            // try
            // {
                await CreateInquiryDocumentIfNotExists("RotamLandingPage", "ContactInfo", inquiry);

                await SendConfirmationEmailAsync(inquiry.contact, confirmationMessage);

                return Ok(inquiry);
            // }
            // catch (Exception e)
            // {
            //     Debug.WriteLine(e);
            //     return StatusCode(StatusCodes.Status500InternalServerError);
            // }

        }

        [HttpPost]
        public IActionResult SendInsightsEvent([FromBody] InsightsEvent insightsEvent)
        {

            if (ValidPageView(insightsEvent.pageName))
            {
                Telemetry.TrackPageView(insightsEvent.pageName);
                return StatusCode(StatusCodes.Status201Created);
            }

            return BadRequest("Invalid Page View Type");

        }


        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        private DocumentClient GetDocumentDb()
        {
            return new DocumentClient(new Uri(EndpointUri), PrimaryKey);
        }

        private async Task CreateContactDocumentIfNotExists(string databaseName, string collectionName, Contact contact)
        {

            await SendNotificationEmailAsync("Contact info has been sent from: " +
                                             Request.GetUri() + " by: " + contact.Name);
            try
            {
                //send id... change type to int so it defaults to 0 and call toString();
                await this.documentClient.ReadDocumentAsync(UriFactory.CreateDocumentUri(databaseName, collectionName, "0"));
                Debug.WriteLine("Contact exists {0}", contact.Name);
            }
            catch (DocumentClientException de)
            {
                if (de.StatusCode == HttpStatusCode.NotFound)
                {
                    await this.documentClient.CreateDocumentAsync(UriFactory.CreateDocumentCollectionUri(databaseName, collectionName), contact);
                    Debug.WriteLine("Created Contact {0}", contact.Name);
                }
                else
                {
                    throw;
                }
            }
        }

        private async Task CreateInquiryDocumentIfNotExists(string databaseName, string collectionName, Inquiry inquiry)
        {

            await SendNotificationEmailAsync("An inquiry has been sent from: " +
                                             Request.GetUri() + " by: " + inquiry.contact.Name);
            try
            {
                //ToDo: Create a new contact and link it to the contact in the inquiry
                //ToDo: Send id... change type to int so it defaults to 0 and call toString();
                await this.documentClient.ReadDocumentAsync(UriFactory.CreateDocumentUri(databaseName, collectionName, "0"));
                Debug.WriteLine("Inquiry exists {0}", inquiry.contact.Name);
            }
            catch (DocumentClientException de)
            {
                if (de.StatusCode == HttpStatusCode.NotFound)
                {
                    await this.documentClient.CreateDocumentAsync(UriFactory.CreateDocumentCollectionUri(databaseName, collectionName), inquiry);
                    Debug.WriteLine("Inquiry created {0}", inquiry.contact.Name);
                }
                else
                {
                    throw;
                }
            }
        }

        private async Task SendConfirmationEmailAsync(Contact contact, string message)
        {

            await this.EmailService.SendEmail(contact, message);
        }


        private async Task SendNotificationEmailAsync(string message)
        {
            var mailKey = System.Configuration.ConfigurationManager.AppSettings["emailKey"];
            var fromEmail = System.Configuration.ConfigurationManager.AppSettings["fromEmailAddress"];
            var fromEmailName = System.Configuration.ConfigurationManager.AppSettings["fromEmailName"];

            var client = new SendGridClient(mailKey);
            var from = new EmailAddress(fromEmail, fromEmailName);
            var subject = "A message from Rotam";
            var to = new EmailAddress("castriganoj@gmail.com", "Jim");
            var plainTextContent = message;
            var htmlContent = message;
            var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
            await client.SendEmailAsync(msg);
        }

        private bool ValidPageView(string insightsEvent)
        {
            return Enum.GetNames(typeof(PageViewType)).Contains(insightsEvent);
        }
    }

    
    public class Contact
    {
        [JsonProperty(PropertyName = "id")]
        public string Id { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        public bool ContactVerified { get; set; }

        public Guid verifyToken { get; set; }


        public Contact()
        {
            verifyToken = Guid.NewGuid();
        }
    }

    public class Inquiry
    {
        [JsonProperty(PropertyName = "id")]
        public string Id { get; set; }

        public Contact contact { get; set; }

        public string message { get; set; }

    }

    public class InsightsEvent
    {
        public string pageName { get; set; }
        public IDictionary<string,string> HtmlElement { get; set; }
    }

    public enum PageViewType
    {

        intro,
        benefits,
        features,
        signUp,
        progress,
        moreFeatures,
        contact
    }

    

}
