"""Build the three-page ICS 511 report from verified local evidence."""
import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / '.report-pdf-runtime'))
from PIL import Image as PILImage
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, Table, TableStyle, Image
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader

OUT = ROOT / 'deliverables'
QA = ROOT / 'output' / 'report-qa'
QA.mkdir(parents=True, exist_ok=True)
pdfmetrics.registerFont(TTFont('Arial', 'C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('Arial-Bold', 'C:/Windows/Fonts/arialbd.ttf'))
pdfmetrics.registerFontFamily('Arial', normal='Arial', bold='Arial-Bold')
W, H = 595.276, 841.89
M, BOTTOM = 45, 43
CW = W - 2*M
styles = {
    'body': ParagraphStyle('body', fontName='Arial', fontSize=9.5, leading=13.2, textColor=colors.black),
    'small': ParagraphStyle('small', fontName='Arial', fontSize=8, leading=10.4, textColor=colors.HexColor('#333333')),
    'caption': ParagraphStyle('caption', fontName='Arial', fontSize=8.5, leading=11.3, textColor=colors.black),
    'cell': ParagraphStyle('cell', fontName='Arial', fontSize=8.4, leading=11.1),
    'headcell': ParagraphStyle('headcell', fontName='Arial-Bold', fontSize=8.4, leading=11.1, textColor=colors.white),
    'h': ParagraphStyle('h', fontName='Arial-Bold', fontSize=12.2, leading=15, textColor=colors.black),
    'title': ParagraphStyle('title', fontName='Arial-Bold', fontSize=25, leading=29, textColor=colors.black),
}

content_text = []
c = canvas.Canvas(str(OUT / 'ChefShop_Milestone_1_Report.pdf'), pagesize=(W,H))
c.setTitle('ChefShop Milestone 1 Report')
c.setAuthor('ChefShop team')
c.setSubject('ICS 511 Web Programming Winter Semester 2026 Idea 6')
y = H-M

def para(text, style='body', after=7, width=None, x=M):
    global y
    content_text.append(text)
    p = Paragraph(text, styles[style])
    _, ph = p.wrap(width or CW, H)
    if y-ph < BOTTOM:
        raise ValueError(f'Page overflow at {text[:70]}: {y-ph:.1f}')
    p.drawOn(c,x,y-ph)
    y -= ph+after

def heading(text):
    global y
    y -= 5
    para(text,'h',6)

def table(headers, rows, widths):
    global y
    data = [[Paragraph(x,styles['headcell']) for x in headers]]
    data += [[Paragraph(x,styles['cell']) for x in row] for row in rows]
    t=Table(data,colWidths=widths,hAlign='LEFT')
    t.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,0),colors.HexColor('#303B40')),
        ('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#F3F5F6')]),
        ('GRID',(0,0),(-1,-1),.45,colors.HexColor('#D9D9D9')),
        ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
        ('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),
        ('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6),
    ]))
    _, th=t.wrap(CW,H)
    if y-th<BOTTOM: raise ValueError('Table overflow')
    t.drawOn(c,M,y-th);y-=th+8

def photo(name, crop, max_h=None):
    global y
    source=OUT/'screenshots'/name
    im=PILImage.open(source).crop(crop)
    dest=QA/name.replace('-window','-crop')
    im.save(dest)
    iw,ih=im.size
    dw=CW;dh=CW*ih/iw
    if max_h and dh>max_h: dw*=max_h/dh;dh=max_h
    if y-dh<BOTTOM: raise ValueError('Image overflow')
    c.drawImage(str(dest),M+(CW-dw)/2,y-dh,width=dw,height=dh)
    y-=dh+5

def page(number, title):
    global y
    y=H-M
    c.setFont('Arial',8)
    c.setFillColor(colors.HexColor('#444444'))
    c.drawString(M,26,'ChefShop  |  ICS 511  |  Milestone 1  |  9 November 2026')
    c.drawRightString(W-M,26,f'{number} / 3')
    c.setFillColor(colors.black)
    para(title,'title',8)

page(1,'ChefShop Milestone 1 Report')
para('ICS 511 Web Programming | Winter Semester 2026<br/>Dr. Amal Aboulhassan | TA Omar El-Barbary','small',10)
para('<b>Team:</b> ChefShop (name confirmation pending) &nbsp; <b>Project:</b> Idea 6','body',7)
table(['Member','Student ID','University email'],[
    ['Steven Elias','7002846','steven.elias@student.giu-uni.de'],
    ['Abdelrahman Akkad','10005705','[Email pending]'],
    ['Omar Nasr','10006523','[Email pending]'],
    ['Ali Hady','10000486','[Email pending]'],
],[145,78,CW-223])
heading('Application and project idea')
para('ChefShop connects a culinary institute with an online store for kitchen tools, spices and meals prepared by students. Egyptian, Italian and Greek dishes shape the catalogue and visual identity. Students can purchase uniforms and knife kits and manage module fees. Accounting staff manage departmental costs and chef pay, including catering allowances.')
para('This milestone implements a browser-based Angular frontend with simulated records and payments. It includes 12 meals, 12 spices, 12 tools, a uniform and a knife kit. Customers can filter products, choose options, change quantities and complete pickup or delivery checkout. Meal pages link to ingredients and tools for recreating the dish.')
heading('Users and authorized information')
table(['User','Authorized access'],[
    ['Guest','Browse Home, Academy and Shop; use the cart and demo checkout.'],
    ['Student','Own profile, orders, invoices, payments and receipts; shopping.'],
    ['Chef','Own profile, salary, deductions and assigned catering allowances.'],
    ['Accounting','Department budgets, profitability, payroll, catering and student fees.'],
    ['Admin','All financial features and user role/status management.'],
],[82,CW-82])
heading('Interface and workflow')
para('The V6 design uses a dark palette, amber actions, a regional fork logo and animated headings. The main shopping flow is Home > Shop > Product > Cart > Checkout > Confirmation. Students and staff reach their permitted workspaces after login. Forms provide validation and success feedback; account and profile pages support pictures and preferences.',after=8)
photo('home-window.png',(82,300,1248,685),max_h=112)
para('Figure 1. Running Home page with the animated meal presentation.','caption',0)
c.showPage()

page(2,'State storage and user experience')
heading('Angular implementation')
para('Standalone Angular components separate the store, accounts and finance features. Signals and computed values update shared state and derived totals; Reactive Forms validate user input. Lazy routes load feature screens on demand, while product images and Chart.js are loaded lazily to reduce unnecessary initial work. Reusable cards, headings, errors and charts keep feedback consistent.')
heading('Storage choices and their effects')
table(['Mechanism','Implementation','Effect and tradeoff'],[
    ['Local storage','JSON demo database, accounts, preferences, masked card metadata, cart, fees, salaries, transactions, product performance and report snapshots.','Survives reloads and browser restarts, saving repeated entry. Remains on the device and is readable or editable by scripts and the browser user; clearing storage removes it.'],
    ['Session storage','An eight-hour login session, safe checkout draft fields and guest order confirmations.','Retains progress across reloads in the same tab. Closing the tab normally clears the session, reducing long-term retention of temporary identity/contact data. It remains accessible to scripts.'],
    ['Cookies','Theme and preference-choice cookies with a one-year Max-Age, Path=/ and SameSite=Lax; Secure is added under HTTPS.','Remembers presentation choices without placing identity in cookies. Cookies may accompany matching requests, so these small values are non-sensitive; JavaScript can read them.'],
],[77,200,CW-277])
para('Storage keys use the chefshop: prefix. Read/write failures show a warning and allow in-memory use or demo defaults rather than silently claiming that data was saved. Persistent cart and form state save time, while visible preferences let users control motion, sound and presentation.','body',8)
heading('Authentication privacy and security')
para('Signup stores a salted PBKDF2 SHA-256 password hash with 100,000 iterations instead of plaintext. New accounts receive the Student role. Route guards and service checks restrict finance actions, and student/chef views filter records by owner. Sessions expire after eight hours; sign-out removes session and checkout draft data.')
para('Only a demo card\'s last four digits, expiry and holder name are saved. Full card numbers and CVCs are discarded and excluded from checkout drafts. Profile uploads accept JPG, PNG or WebP up to 500 KB. Test data is required: no real payment is collected. Browser storage and client-side authorization can be tampered with; server-side authentication, validation and access control are work for the next milestone.')
heading('Responsive design accessibility and verification')
para('Responsive grids and tables adapt at CSS breakpoints. Labels, validation messages, focus indicators, a keyboard skip link and chart data tables support navigation and interpretation. Reduced-motion settings replace the autoplay hero with a still image and limit decorative motion. Optional sound provides brief feedback.')
para('On 9 November 2026, all 36 Jasmine/Karma tests passed and the production build succeeded. Tests cover authentication, permissions, cart calculations, financial records, event approval, report snapshots, fee ownership, partial payments and validation, with regression tests for motion, selects and the skip link. Browser QA exercised the main flows at emulated 390 x 844, 768 x 1024 and 1440 x 900 viewports; physical-device and full cross-browser testing were not performed.')
c.showPage()

page(3,'Sample runs and validation')
para('These screenshots show the running frontend with synthetic November 2026 records. Financial examples below reflect the local QA edits. All amounts are in Egyptian pounds.','body',9)
photo('budgets-window.png',(326,380,989,609),max_h=176)
para('<b>Figure 2. Department budgets.</b> Editing a Kitchen ingredient expense from EGP 123 to EGP 124 updated the ledger and chart. Total expenses became EGP 90,524; the balance before payroll became EGP 95,876.','caption',8)
photo('payroll-window.png',(326,427,989,644))
para('<b>Figure 3. Payroll.</b> Salary, allowance and deduction changes produced net payroll of EGP 48,050; Nadia\'s net was EGP 17,050. The earlier downloaded JSON snapshot was parsed separately: three staff rows summed correctly to its EGP 46,400 total.','caption',8)
photo('fees-window.png',(326,380,989,642))
para('<b>Figure 4. Student fees.</b> A demo EGP 100 payment reduced Alex\'s invoice balance to EGP 2,300. Accounting created and fully paid a separate EGP 100 QA invoice. Paid status, history and student ownership restrictions were verified.','caption',8)
para('<b>Other sample results:</b> pickup order CS-315C8AB9 totalled EGP 165; delivery added EGP 30. Invalid login and unauthorized routes were rejected. Reloading retained the session, cart and theme. Evidence is saved in the QA log, test/build logs and payroll JSON.','small',0)
c.showPage();c.save()
report=OUT/'ChefShop_Milestone_1_Report.pdf'
reader=PdfReader(report)
assert len(reader.pages)==3, f'Expected 3 pages, got {len(reader.pages)}'
(QA/'report-text.txt').write_text('\n\n'.join(content_text),encoding='utf-8')
import pymupdf
doc=pymupdf.open(report)
for n,p in enumerate(doc):
    p.get_pixmap(matrix=pymupdf.Matrix(1.6,1.6),alpha=False).save(QA/f'page-{n+1}.png')
print(f'Created {report} ({len(reader.pages)} pages)')
