import type { Analysis } from "../lib/types";

export interface DemoScenario {
  id: string;
  title_en: string;
  title_ur: string;
  text: string;
  /** Prepared result used ONLY if the AI call fails during a live demo. */
  fallback: Analysis;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "workplace",
    title_en: "Boss harassing me at work",
    title_ur: "دفتر میں باس کی ہراسانی",
    text: "میں لاہور میں ایک پرائیویٹ کمپنی میں کام کرتی ہوں۔ میرا باس پچھلے تین مہینوں سے مجھے رات کو واٹس ایپ پر نامناسب پیغامات بھیجتا ہے اور میٹنگ میں میرے لباس پر تبصرے کرتا ہے۔ جب میں نے منع کیا تو اس نے کہا کہ اگر کسی کو بتایا تو میری نوکری اور تنخواہ کی ترقی ختم ہو جائے گی۔ ایچ آر میں بھی اس کا دوست ہے۔ مجھے نہیں پتا کیا کروں۔",
    fallback: {
      category: "workplace_harassment",
      urgency: "high",
      summary_ur:
        "آپ کا باس تین ماہ سے آپ کو نامناسب پیغامات بھیج رہا ہے، آپ کے لباس پر تبصرے کرتا ہے، اور شکایت کرنے پر نوکری ختم کرنے کی دھمکی دیتا ہے۔ یہ کام کی جگہ پر ہراسانی ہے۔",
      summary_en:
        "Your boss has been sending you inappropriate messages for three months, commenting on your clothes in meetings, and threatening your job if you complain. This is workplace harassment.",
      applicable_law_ids: ["pahwa-2010-s2", "pahwa-2010-s8", "pahwa-2010-s4", "ppc-509"],
      rights_explained_ur:
        "قانون کے مطابق نامناسب جنسی پیغامات، تبصرے اور انکار پر نوکری کی دھمکی ہراسانی ہے۔ آپ کو حق ہے کہ ادارے کی انکوائری کمیٹی یا براہِ راست محتسب کو شکایت کریں۔ چونکہ ایچ آر پر بھروسہ نہیں، آپ سیدھا محتسب کے پاس جا سکتی ہیں۔ شکایت کی وجہ سے آپ کو نوکری سے نکالنا یا سزا دینا غیر قانونی ہے۔",
      rights_explained_en:
        "Inappropriate sexual messages, comments, and threatening your job for refusing are harassment under the law. You can complain to your organisation's Inquiry Committee or directly to the Ombudsperson. Since you don't trust HR, you can go straight to the Ombudsperson. Punishing you for complaining is not allowed.",
      forum: "Provincial Ombudsperson for Protection against Harassment (Punjab) or FOSPAH",
      forum_ur: "صوبائی محتسب برائے انسدادِ ہراسانی (پنجاب) یا فوسپاہ",
      next_steps: [
        "Save all WhatsApp messages: screenshot with his number, date and time visible; export the chat.",
        "Write a private diary of every incident: date, time, what was said, who was present.",
        "Draft a written complaint to the Ombudsperson (use 'Draft my complaint').",
        "Call 1099 for free legal advice before or after filing.",
        "Keep copies of your appointment letter and performance reviews.",
      ],
      next_steps_ur: [
        "واٹس ایپ کے تمام پیغامات محفوظ کریں: نمبر، تاریخ اور وقت کے ساتھ اسکرین شاٹ لیں؛ چیٹ ایکسپورٹ کریں۔",
        "ہر واقعے کی نجی ڈائری لکھیں: تاریخ، وقت، کیا کہا گیا، کون موجود تھا۔",
        "محتسب کے نام تحریری شکایت تیار کریں ('میری شکایت کا مسودہ' استعمال کریں)۔",
        "مفت قانونی مشورے کے لیے 1099 پر کال کریں۔",
        "اپنے تقرر نامے اور کارکردگی رپورٹس کی کاپیاں رکھیں۔",
      ],
      evidence_checklist: [
        "Screenshots / exported WhatsApp chat",
        "Incident diary with dates",
        "Names of colleagues who witnessed comments",
        "Appointment letter / salary slips",
        "Any emails showing threats about promotion",
      ],
      evidence_checklist_ur: [
        "اسکرین شاٹس / ایکسپورٹ شدہ واٹس ایپ چیٹ",
        "تاریخوں کے ساتھ واقعات کی ڈائری",
        "تبصرے سننے والے ساتھیوں کے نام",
        "تقرر نامہ / تنخواہ کی سلپس",
        "ترقی کے بارے میں دھمکی والی کوئی ای میل",
      ],
    },
  },
  {
    id: "domestic",
    title_en: "Husband violence & threats",
    title_ur: "شوہر کا تشدد اور دھمکیاں",
    text: "My husband beats me when he gets angry, last night he hit me and pushed me against the wall. He took my phone and said if I go to my parents' house he will kill me and take the children. I live in Rawalpindi. I am scared he will do it again tonight.",
    fallback: {
      category: "domestic_violence",
      urgency: "emergency",
      summary_ur:
        "آپ کا شوہر آپ کو مارتا ہے، کل رات اس نے آپ کو دیوار سے دھکا دیا، فون چھین لیا اور جان سے مارنے اور بچے چھیننے کی دھمکی دی۔ آپ کو آج رات پھر خطرہ ہے۔",
      summary_en:
        "Your husband physically abuses you; last night he hit you, pushed you against a wall, took your phone, and threatened to kill you and take the children. You fear it will happen again tonight.",
      applicable_law_ids: ["punjab-pwav-2016", "ppc-506", "mflo-1961-s9"],
      rights_explained_ur:
        "آپ کو اپنے گھر میں محفوظ رہنے کا حق ہے۔ جان سے مارنے کی دھمکی جرم ہے۔ پنجاب کے قانون کے تحت عدالت شوہر کو آپ سے دور رہنے کا حکم، آپ کو گھر میں رہنے یا پناہ گاہ کا حکم، اور خرچہ دینے کا حکم دے سکتی ہے۔ صرف دھمکی کی بنیاد پر بچے آپ سے نہیں چھینے جا سکتے؛ حوالگی کا فیصلہ عدالت کرتی ہے۔",
      rights_explained_en:
        "You have the right to be safe in your home. Threatening to kill is a crime. Under the Punjab law, the court can order your husband to stay away, let you stay in the house or a shelter, and order him to pay maintenance. Children cannot simply be taken from you by threat — custody is decided by a court.",
      forum: "Police (15) now; then Violence Against Women Centre / Women Protection Officer, Rawalpindi",
      forum_ur: "ابھی پولیس (15)؛ پھر وائلنس اگینسٹ ویمن سینٹر / ویمن پروٹیکشن آفیسر، راولپنڈی",
      next_steps: [
        "If you are in danger now, call 15. If you can, go to a trusted relative or neighbour.",
        "Call 1043 Punjab Women Helpline (24/7) for shelter (Dar-ul-Aman) and protection support.",
        "Get a medical examination (MLC) at a government hospital and keep the report.",
        "Ask police to register an FIR for the assault and death threats.",
        "Call 1099 for free legal help with a protection order and maintenance.",
      ],
      next_steps_ur: [
        "اگر ابھی خطرہ ہے تو 15 پر کال کریں۔ ہو سکے تو کسی قابلِ اعتماد رشتہ دار یا پڑوسی کے پاس جائیں۔",
        "پناہ گاہ (دارالامان) اور تحفظ کے لیے 1043 پنجاب ویمن ہیلپ لائن (چوبیس گھنٹے) پر کال کریں۔",
        "سرکاری ہسپتال سے میڈیکل معائنہ (ایم ایل سی) کروائیں اور رپورٹ رکھیں۔",
        "پولیس سے مارپیٹ اور جان سے مارنے کی دھمکی کی ایف آئی آر درج کروائیں۔",
        "حفاظتی حکم اور خرچے کے لیے مفت قانونی مدد کے لیے 1099 پر کال کریں۔",
      ],
      evidence_checklist: [
        "Photos of injuries (with date)",
        "Medico-legal certificate (MLC) from hospital",
        "Names of neighbours/relatives who heard or saw",
        "Any threatening messages or voice notes",
        "Copies of nikahnama, CNIC, children's B-forms (keep safely)",
      ],
      evidence_checklist_ur: [
        "چوٹوں کی تصاویر (تاریخ کے ساتھ)",
        "ہسپتال کا میڈیکو لیگل سرٹیفکیٹ",
        "سننے یا دیکھنے والے پڑوسیوں/رشتہ داروں کے نام",
        "کوئی دھمکی آمیز پیغامات یا وائس نوٹس",
        "نکاح نامہ، شناختی کارڈ، بچوں کے ب فارم کی کاپیاں (محفوظ جگہ رکھیں)",
      ],
    },
  },
  {
    id: "inheritance",
    title_en: "Brothers denying my inheritance",
    title_ur: "بھائی وراثت نہیں دے رہے",
    text: "Mere abbu ka do saal pehle inteqal hua. Islamabad mein ek ghar aur gaon mein zameen hai. میرے بھائی کہتے ہیں کہ بیٹیوں کا حصہ نہیں ہوتا اور مجھ سے ایک کاغذ پر دستخط کروانا چاہتے ہیں کہ میں اپنا حصہ چھوڑ رہی ہوں۔ امی بھی ان کے ساتھ ہیں۔",
    fallback: {
      category: "property_inheritance",
      urgency: "normal",
      summary_ur:
        "آپ کے والد کے انتقال کے بعد آپ کے بھائی آپ کو اسلام آباد کے گھر اور گاؤں کی زمین میں حصہ نہیں دے رہے اور حصہ چھوڑنے کے کاغذ پر دستخط کروانا چاہتے ہیں۔",
      summary_en:
        "After your father's death, your brothers are refusing your share in the house in Islamabad and the village land, and are pressuring you to sign a paper giving up your share.",
      applicable_law_ids: ["ewpra-2020"],
      rights_explained_ur:
        "بیٹی کا وراثت میں حصہ قانونی اور شرعی حق ہے، اور کوئی اسے زبردستی ختم نہیں کر سکتا۔ کسی کاغذ پر دستخط نہ کریں جب تک آپ پوری طرح نہ سمجھ لیں۔ اسلام آباد کی جائیداد کے لیے آپ وفاقی محتسب کو شکایت کر سکتی ہیں، جو ڈپٹی کمشنر سے رپورٹ لے کر قبضہ دلوا سکتا ہے۔ گاؤں کی زمین کے لیے اپنے صوبے کے محتسب سے رجوع کریں۔",
      rights_explained_en:
        "A daughter's share of inheritance is a legal and religious right; no one can cancel it by force. Do not sign any paper until you fully understand it. For the Islamabad property you can complain to the Federal Ombudsperson, who can get a report from the Deputy Commissioner and order possession. For the village land, approach your province's Ombudsperson.",
      forum: "Federal Ombudsperson (FOSPAH) under the Enforcement of Women's Property Rights Act 2020",
      forum_ur: "خواتین کے حقِ جائیداد کے قانون 2020 کے تحت وفاقی محتسب (فوسپاہ)",
      next_steps: [
        "Do NOT sign any relinquishment or 'hiba' paper under pressure.",
        "Get your father's death certificate and NADRA Family Registration Certificate (FRC).",
        "Get the fard / registry copy of the house and land from the land record office.",
        "File a complaint with FOSPAH (051-9264444) for the Islamabad property.",
        "Call 1099 for free advice on the village land and succession certificate.",
      ],
      next_steps_ur: [
        "دباؤ میں حصہ چھوڑنے یا ہبہ کے کسی کاغذ پر دستخط نہ کریں۔",
        "والد کا ڈیتھ سرٹیفکیٹ اور نادرا کا فیملی رجسٹریشن سرٹیفکیٹ حاصل کریں۔",
        "لینڈ ریکارڈ آفس سے گھر اور زمین کی فرد / رجسٹری کی کاپی لیں۔",
        "اسلام آباد کی جائیداد کے لیے فوسپاہ (051-9264444) کو شکایت کریں۔",
        "گاؤں کی زمین اور وراثتی سرٹیفکیٹ کے لیے مفت مشورے کے لیے 1099 پر کال کریں۔",
      ],
      evidence_checklist: [
        "Father's death certificate",
        "NADRA Family Registration Certificate",
        "Fard / registry / mutation (inteqal) copies",
        "Any messages where brothers refuse your share",
        "Copy of any paper they asked you to sign (photo it, don't sign)",
      ],
      evidence_checklist_ur: [
        "والد کا ڈیتھ سرٹیفکیٹ",
        "نادرا فیملی رجسٹریشن سرٹیفکیٹ",
        "فرد / رجسٹری / انتقال کی کاپیاں",
        "بھائیوں کے انکار والے پیغامات",
        "جس کاغذ پر دستخط مانگے گئے اس کی تصویر (دستخط نہ کریں)",
      ],
    },
  },
];
