from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import math

OUT=Path(__file__).parent
S=2
W,H=2400,2050
im=Image.new('RGB',(W*S,H*S),'#F5F0E6')
d=ImageDraw.Draw(im)
C={'ink':'#263D29','muted':'#626954','rust':'#AD492B','sage':'#E4E8D5','white':'#FFFEF8','line':'#D2D5C2','peach':'#F3E0D2'}
def font(size,bold=False,serif=False):
    return ImageFont.truetype('C:/Windows/Fonts/'+('georgiab.ttf' if serif and bold else 'georgia.ttf' if serif else 'arialbd.ttf' if bold else 'arial.ttf'),int(size*S))
def txt(x,y,s,size=24,color='ink',bold=False,serif=False):
    for i,line in enumerate(s.split('\n')):d.text((x*S,(y+i*size*1.42)*S),line,font=font(size,bold,serif),fill=C.get(color,color))
def box(x,y,w,h,heading,body='',tone='white',size=23):
    d.rounded_rectangle((x*S,y*S,(x+w)*S,(y+h)*S),radius=18*S,fill=C[tone],outline=C['line'],width=2*S)
    txt(x+24,y+22,heading,29,'ink',True,True)
    if body:txt(x+24,y+77,body,size,'muted')
def arrow(points,label=None,lx=None,ly=None,color='rust',width=3):
    pts=[(int(x*S),int(y*S)) for x,y in points]
    d.line(pts,fill=C[color],width=width*S,joint='curve')
    a,b=points[-2],points[-1];ang=math.atan2(b[1]-a[1],b[0]-a[0]);r=13
    tri=[b,(b[0]-r*math.cos(ang-.5),b[1]-r*math.sin(ang-.5)),(b[0]-r*math.cos(ang+.5),b[1]-r*math.sin(ang+.5))]
    d.polygon([(int(x*S),int(y*S)) for x,y in tri],fill=C[color])
    if label:txt(lx,ly,label,20,color,True)
def section(y,label,sub):
    d.line((80*S,y*S,2320*S,y*S),fill=C['line'],width=2*S)
    txt(80,y+24,label,31,'ink',True,True);txt(80,y+77,sub,22,'muted')

txt(80,50,'ChefShop / Customer workflow',59,'ink',True,True)
txt(80,132,'Seven core pages. Optional meal-to-product discovery. One shared cart.',28,'muted')
section(210,'01  Browse, choose, and order','Each category opens the same Shop page with the relevant tab already selected.')
xs=[80,455,830,1205,1580,1955]
titles=['1. Home','2. Shop','3. Product details','4. Cart','5. Checkout','6. Confirmation']
bodies=['Shop now\nChoose a category','Tools / Spices / Meals\nFilter, search, sort','Choose option + quantity\nAdd item → confirmation','Edit quantities / remove\nRecalculate totals','Delivery or campus pickup\nValidate and place order','Saved order only\nItems, total, slot, payment']
for x,t,b in zip(xs,titles,bodies):box(x,350,340,195,t,b,'sage' if t.startswith('6.') else 'white',21)
for i in range(5):arrow([(xs[i]+340,447),(xs[i+1],447)])
box(80,598,340,160,'7. Academy','Programs + student kitchen\nExplore programs scrolls',size=21)
arrow([(200,545),(200,598)],'Explore academy',225,555)
arrow([(420,675),(570,675),(570,545)],'Shop student meals',590,643)
txt(900,607,'Navigation retains context',27,'ink',True,True)
txt(900,655,'Continue shopping restores the previous Shop category.\nOrder confirmation links to Shop and Home.\nCategory counts and availability come from the same product data.',23,'muted')
section(804,'02  A meal can inspire the next purchase','Ingredients are informative; only linked products that the store actually sells are shoppable.')
box(80,991,420,225,'Meal details','Ingredients + allergens\nPrimary: Add meal to cart\nOptional: Recreate it at home',tone='sage',size=23)
box(610,946,440,180,'Spice details','View spice → select pack size\nExample: Black Pepper 50 g',size=23)
box(610,1180,440,180,'Tool details','View tool → select capacity\nExample: Saucepan 2 L',size=23)
box(1190,1058,450,205,'Shared cart','Meals + spices + tools\nIndependent quantities\nOne checkout',tone='peach',size=23)
arrow([(500,1040),(553,1040),(553,1030),(610,1030)],'View spice',505,1004)
arrow([(500,1143),(553,1143),(553,1255),(610,1255)],'View tool',503,1280)
arrow([(1050,1035),(1110,1035),(1110,1116),(1190,1116)])
arrow([(1050,1260),(1110,1260),(1110,1198),(1190,1198)])
txt(1730,1010,'Linked both ways',28,'ink',True,True)
txt(1730,1068,'Spice → Cook with this spice → meal\nTool → Used for this meal → meal\nBack to meal preserves its options\nand selected quantity.',23,'muted')
txt(1730,1240,'Adding an item shows “View cart”\nand “Continue shopping”.\nIt does not force a bundle purchase.',23,'muted')
section(1410,'03  Checkout states and success rules','Example cart: Alfredo 160 + Black Pepper 40 + Saucepan 450 = EGP 650. All data is illustrative.')
box(80,1572,300,219,'Fulfillment','Choose delivery\nor campus pickup',tone='sage',size=24)
box(455,1535,380,153,'Delivery','Address + date + slot\nEGP 650 + 30 = 680',size=23)
box(455,1745,380,153,'Campus pickup','Collection details + slot\nNo address · EGP 650',size=23)
arrow([(380,1640),(418,1640),(418,1610),(455,1610)])
arrow([(380,1727),(418,1727),(418,1820),(455,1820)])
box(930,1604,352,236,'Validate','Contact + required fields\nAvailable slot + stock\nInvalid → inline errors\nKeep cart and entered data',size=23)
arrow([(835,1610),(885,1610),(885,1677),(930,1677)])
arrow([(835,1820),(885,1820),(885,1765),(930,1765)])
box(1380,1604,360,236,'Submit once','Disable repeat clicks\nSave order / process card\nFailure → stay + retry\nNo premature confirmation',size=23)
arrow([(1282,1720),(1380,1720)])
box(1845,1604,450,236,'Order succeeds','Show confirmation + reference\nShow chosen fulfillment slot\nPay at pickup = amount due\nNever label unpaid orders paid',tone='sage',size=23)
arrow([(1740,1720),(1845,1720)])
txt(80,1975,'DESIGN SPECIFICATION · Customer-facing scope only · No payment is processed by these mockups.',20,'muted')
im.save(OUT/'06-customer-workflow.png')
print(OUT/'06-customer-workflow.png')
