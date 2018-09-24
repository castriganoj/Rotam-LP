using System;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Documents;
using Microsoft.Azure.Documents.Client;
using Microsoft.IdentityModel.Protocols;
using Newtonsoft.Json;
using Rotam_LP.Models;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace Rotam_LP.Controllers
{
    public class HomeController : Controller
    {

        private const string EndpointUri = "https://jc-personal.documents.azure.com:443/";
        private const string PrimaryKey = "KoT2bqKjHqbuR1ijlz2l2fkJiUYyDAsF3WWffwX68vkxlugmlIm4vWHcDZhWt9BuSB0LnQIKqs7gK4ie9Pteqg==";
        private DocumentClient documentClient;

        public HomeController()
        {
            documentClient = GetDocumentDb();
            
            //ToDo: move to one time execution and startup
            documentClient.CreateDatabaseIfNotExistsAsync(new Database() {Id = "RotamLandingPage"});
            documentClient.CreateDocumentCollectionIfNotExistsAsync(UriFactory.CreateDatabaseUri("RotamLandingPage"), new DocumentCollection { Id = "ContactInfo" });
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

                await SendConfirmationEmailAsync(contact);

                return Ok(contact);
            }
            catch(Exception e )
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
           
        }
        
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        private DocumentClient GetDocumentDb()
        {
           return new DocumentClient(new Uri(EndpointUri), PrimaryKey);
        }

        private async Task SendConfirmationEmailAsync(Contact contact)
        {
            var mailKey = System.Configuration.ConfigurationManager.AppSettings["emailKey"];
            var fromEmail = System.Configuration.ConfigurationManager.AppSettings["fromEmailAddress"];
            var fromEmailName = System.Configuration.ConfigurationManager.AppSettings["fromEmailName"];

            var client = new SendGridClient(mailKey);
            var from = new EmailAddress(fromEmail, fromEmailName);
            var subject = "Sending with SendGrid is Fun";
            var to = new EmailAddress("castriganoj@gmail.com", "Example User");
            var plainTextContent = "and easy to do anywhere, even with C#";
            var htmlContent = "<strong>and easy to do anywhere, even with C#</strong>";
            var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
            var response = await client.SendEmailAsync(msg);
        }

        private async Task CreateContactDocumentIfNotExists(string databaseName, string collectionName, Contact contact)
        {
            try
            {
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

    }




    public class Contact
    {
        [JsonProperty(PropertyName = "id")]
        public string Id{ get; set; }

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
}
