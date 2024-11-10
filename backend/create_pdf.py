from fpdf import FPDF
from datetime import datetime, date
import os, smtplib, threading, pytz
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

pdf = FPDF()

def sanitize_text(text: str) -> str:
    # Replace problematic characters with a safe equivalent
    return text.replace('\u2019', "'")

def make_pdf(name, report_id, date_of_birth, email, gender, date_started, severity, symptoms, past_history, recommended_actions):
    name = sanitize_text(name)
    date_of_birth = sanitize_text(date_of_birth)
    email = sanitize_text(email)
    gender = sanitize_text(gender)
    date_started = sanitize_text(date_started)
    severity = sanitize_text(severity)
    symptoms = sanitize_text(symptoms)
    past_history = sanitize_text(past_history)
    recommended_actions = sanitize_text(recommended_actions)
    name = ''.join(name.split())
    pdf_directory = os.getcwd()
    pdf.add_page()

    pdf.set_font("Arial", "B", 20)      
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 10, "Preliminary Assessment Report", align="C", ln=True)

    y_position = pdf.get_y()
    section_width = 65
    start_date = date.today()

    pdf.set_font("Arial", "I", 10)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(60, 10, f"Date: {start_date}", align="L")

    # pdf.line(section_width, y_position, section_width, y_position + 10)

    time = datetime.now().astimezone()
    formatted_time = time.strftime('%H:%M %Z')
    pdf.cell(60, 10, f"Time: {formatted_time}", align="C")

    # pdf.line(section_width * 2, y_position, section_width * 2, y_position + 10)
    pdf.cell(60, 10, f"Report ID: {report_id}", align="R", ln=True)

    pdf.line(0, 40, 210, 40)

    pdf.set_font("Arial", "B", 14)
    pdf.set_text_color(0, 0, 0)
    pdf.ln(15)
    pdf.cell(20, 10, "Patient Information: ")
    
    pdf.set_font("Arial", "", 12)
    pdf.set_text_color(0, 0, 0)
    pdf.ln(10)
    pdf.cell(0, 10, f"Name: {name}", ln=True)
    pdf.cell(0, 10, f"DOB: {date_of_birth}", ln=True)
    pdf.cell(0, 10, f"Email: {email}", ln=True)
    pdf.cell(0, 10, f"Gender: {gender}", ln=True)

    pdf.set_font("Arial", "B", 14)
    pdf.set_text_color(0, 0, 0)
    pdf.ln(10)
    pdf.cell(20, 10, "Chief Complaint: ")

    pdf.set_font("Arial", "", 12)
    pdf.set_text_color(0, 0, 0)
    pdf.ln(10)
    pdf.cell(0, 10, f"Sickness", ln=True)
    pdf.cell(0, 10, f"Onset: {date_started}", ln=True)
    pdf.cell(0, 10, f"Severity: {severity}", ln=True)

    pdf.set_font("Arial", "B", 14)
    pdf.set_text_color(0, 0, 0)
    pdf.ln(10)
    pdf.cell(20, 10, "Current Symptoms: ")
    pdf.ln(10)
    pdf.set_font("Arial", "", 12)
    pdf.cell(0, 10, f"{symptoms}", ln=True)

    pdf.set_font("Arial", "B", 14)
    pdf.set_text_color(0, 0, 0)
    pdf.ln(10)
    pdf.cell(20, 10, "Past Medical History: ")

    pdf.set_font("Arial", "", 12)
    pdf.set_text_color(0, 0, 0)
    pdf.ln(10)
    print("PAST HISTORY: ", past_history)
    for item in past_history:
        pdf.cell(0, 10, item["item"], ln=True)


    pdf.set_font("Arial", "B", 14)
    pdf.set_text_color(0, 0, 0)
    pdf.ln(10)
    pdf.cell(20, 10, "Recommended Action: ")

    pdf.set_font("Arial", "", 12)
    pdf.set_text_color(0, 0, 0)
    pdf.ln(10)
    pdf.cell(0, 10, f"{recommended_actions}", ln=True)


    print("PDF CREATED HEREL ", pdf_directory)
    pdf.output(os.path.join(pdf_directory, f"{name}-Medical-Report-{start_date}.pdf"))

    send_email(email, pdf_directory)

def send_email(recipient, pdf_directory):
    try:
        me = "ctrl.alt.elite.taps@gmail.com"

        # Create message container
        msg = MIMEMultipart('alternative')
        msg['Subject'] = "Medical Report"
        msg['From'] = me
        msg['To'] = recipient

        # Create the body of the message (HTML Version)
        html = """\
        <html>
        <head></head>
        <body>
            <p>Hi!<br><br>
            Please see the medical report below!<br><br>
            Best,<br>
            OmniDoc
            <br>
            </p>
        </body>
        </html>
        """

        part1 = MIMEText(html, 'html')

        # Attach parts into message container.
        msg.attach(part1)   

        #Attach the PDF to the email
        with open(pdf_directory, "rb") as attachment:
            part = MIMEApplication(attachment.read(), Name=os.path.basename(pdf_directory))
            part['Content-Disposition'] = f'attachment; filename="{os.path.basename(pdf_directory)}"'
            msg.attach(part)

        # Send the message via local SMTP server.
        mail = smtplib.SMTP('smtp.gmail.com', 587)

        mail.ehlo()

        mail.starttls()

        mail.login('ctrl.alt.elite.taps@gmail.com', 'acik plrm mnzf lybx')
        mail.sendmail(me, recipient, msg.as_string())
        mail.quit()
    except Exception as e:
        print("ERROR: ", str(e))