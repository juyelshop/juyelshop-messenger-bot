# ফেসবুক মেসেঞ্জার বট সেটআপ গাইড — JUYEL SHOP

এই গাইডে আপনি শিখবেন কিভাবে আপনার ফেসবুক পেজ (facebook.com/juyelshop1) এর মেসেঞ্জারে একটি অটোমেটিক রিপ্লাই বট সেটআপ করবেন। কাস্টমার কোনো প্রোডাক্টের নাম লিখলে বটটি স্বয়ংক্রিয়ভাবে juyelshop.com থেকে প্রোডাক্টের **দাম, ছবি এবং বিবরণ** পাঠাবে।

---

## সূচিপত্র

1. [প্রয়োজনীয় জিনিস](#১-প্রয়োজনীয়-জিনিস)
2. [Facebook Developer Account তৈরি](#২-facebook-developer-account-তৈরি)
3. [Facebook App তৈরি](#৩-facebook-app-তৈরি)
4. [Page Access Token তৈরি](#৪-page-access-token-তৈরি)
5. [বট কোড ডিপ্লয় করা (Render.com — ফ্রি)](#৫-বট-কোড-ডিপ্লয়-করা)
6. [Webhook সেটআপ](#৬-webhook-সেটআপ)
7. [বট টেস্ট করা](#৭-বট-টেস্ট-করা)
8. [বট লাইভ করা (App Review)](#৮-বট-লাইভ-করা)
9. [সমস্যা ও সমাধান](#৯-সমস্যা-ও-সমাধান)

---

## ১. প্রয়োজনীয় জিনিস

আপনার নিচের জিনিসগুলো লাগবে:

| বিষয় | বিবরণ |
|-------|--------|
| ফেসবুক পেজ | facebook.com/juyelshop1 (আপনার পেজে Admin access থাকতে হবে) |
| Facebook Developer Account | ফ্রি — developers.facebook.com |
| GitHub Account | ফ্রি — github.com (কোড আপলোড করতে) |
| Render.com Account | ফ্রি — render.com (বট হোস্ট করতে) |
| ওয়েবসাইট | juyelshop.com (এখান থেকে প্রোডাক্ট ডাটা নেওয়া হবে) |

---

## ২. Facebook Developer Account তৈরি

**ধাপ ১:** ব্রাউজারে যান: [https://developers.facebook.com](https://developers.facebook.com)

**ধাপ ২:** আপনার ফেসবুক অ্যাকাউন্ট দিয়ে লগইন করুন।

**ধাপ ৩:** উপরে ডানদিকে "Get Started" বাটনে ক্লিক করুন।

**ধাপ ৪:** নিয়মাবলী (Terms) Accept করুন এবং আপনার ইমেইল ভেরিফাই করুন।

**ধাপ ৫:** Developer Account তৈরি হয়ে গেলে আপনি Developer Dashboard দেখতে পাবেন।

---

## ৩. Facebook App তৈরি

**ধাপ ১:** Developer Dashboard এ যান: [https://developers.facebook.com/apps](https://developers.facebook.com/apps)

**ধাপ ২:** "Create App" বাটনে ক্লিক করুন।

**ধাপ ৩:** App Type সিলেক্ট করুন:
- **"Business"** সিলেক্ট করুন → "Next" ক্লিক করুন

**ধাপ ৪:** App Details পূরণ করুন:
- **App Name:** `Juyel Shop Bot` (আপনার পছন্দমতো নাম)
- **App Contact Email:** আপনার ইমেইল
- **Business Account:** আপনার Business Account সিলেক্ট করুন (না থাকলে "No Business Account" রাখুন)

**ধাপ ৫:** "Create App" ক্লিক করুন এবং পাসওয়ার্ড দিন।

**ধাপ ৬:** App তৈরি হলে Dashboard এ আসবেন। এখানে "Add Product" সেকশনে **"Messenger"** খুঁজুন এবং **"Set Up"** ক্লিক করুন।

---

## ৪. Page Access Token তৈরি

**ধাপ ১:** App Dashboard এ বামপাশে **"Messenger" → "Settings"** এ যান।

**ধাপ ২:** "Access Tokens" সেকশনে **"Add or Remove Pages"** ক্লিক করুন।

**ধাপ ৩:** আপনার ফেসবুক অ্যাকাউন্ট দিয়ে লগইন করুন এবং **"JUYEL SHOP"** পেজটি সিলেক্ট করুন।

**ধাপ ৪:** সব পারমিশন Allow করুন এবং "Done" ক্লিক করুন।

**ধাপ ৫:** এখন "Access Tokens" সেকশনে আপনার পেজের পাশে **"Generate Token"** বাটন দেখবেন। এটিতে ক্লিক করুন।

**ধাপ ৬:** একটি লম্বা Token দেখাবে — এটি কপি করে রাখুন। এটিই আপনার **PAGE_ACCESS_TOKEN**।

> **⚠️ গুরুত্বপূর্ণ:** এই Token কাউকে শেয়ার করবেন না! এটি দিয়ে আপনার পেজের মেসেজ পড়া ও পাঠানো যায়।

---

## ৫. বট কোড ডিপ্লয় করা

আমরা **Render.com** ব্যবহার করব যেটি ফ্রি হোস্টিং দেয়।

### ধাপ ক: GitHub এ কোড আপলোড

**১.** [github.com](https://github.com) এ লগইন করুন (অ্যাকাউন্ট না থাকলে তৈরি করুন)।

**২.** "New Repository" তৈরি করুন:
- **Repository name:** `juyelshop-messenger-bot`
- **Visibility:** Private
- "Create repository" ক্লিক করুন

**৩.** আপনার কম্পিউটারে এই বটের ফাইলগুলো (server.js, package.json, .env.example) ডাউনলোড করুন।

**৪.** GitHub এ ফাইলগুলো আপলোড করুন:
- Repository পেজে "uploading an existing file" লিংকে ক্লিক করুন
- `server.js`, `package.json`, `.env.example` ফাইলগুলো ড্র্যাগ করুন
- "Commit changes" ক্লিক করুন

### ধাপ খ: Render.com এ ডিপ্লয়

**১.** [render.com](https://render.com) এ যান এবং GitHub অ্যাকাউন্ট দিয়ে Sign Up করুন।

**২.** Dashboard এ **"New +"** → **"Web Service"** ক্লিক করুন।

**৩.** আপনার GitHub Repository (`juyelshop-messenger-bot`) সিলেক্ট করুন।

**৪.** সেটিংস পূরণ করুন:

| সেটিং | মান |
|--------|-----|
| **Name** | juyelshop-messenger-bot |
| **Region** | Singapore (Southeast Asia) |
| **Branch** | main |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free |

**৫.** "Advanced" সেকশনে **Environment Variables** যোগ করুন:

| Key | Value |
|-----|-------|
| `PAGE_ACCESS_TOKEN` | (ধাপ ৪ এ কপি করা Token পেস্ট করুন) |
| `VERIFY_TOKEN` | `juyelshop_verify_token` |
| `PORT` | `3000` |

**৬.** "Create Web Service" ক্লিক করুন।

**৭.** কিছুক্ষণ অপেক্ষা করুন — ডিপ্লয় হয়ে গেলে আপনি একটি URL পাবেন, যেমন:
`https://juyelshop-messenger-bot.onrender.com`

**৮.** এই URL টি ব্রাউজারে খুলুন — যদি "🤖 JUYEL SHOP Messenger Bot is running!" দেখায় তাহলে সফল!

---

## ৬. Webhook সেটআপ

**ধাপ ১:** Facebook Developer Dashboard এ যান → আপনার App → **Messenger → Settings**

**ধাপ ২:** "Webhooks" সেকশনে **"Add Callback URL"** ক্লিক করুন।

**ধাপ ৩:** নিচের তথ্য দিন:

| ফিল্ড | মান |
|--------|-----|
| **Callback URL** | `https://juyelshop-messenger-bot.onrender.com/webhook` |
| **Verify Token** | `juyelshop_verify_token` |

**ধাপ ৪:** "Verify and Save" ক্লিক করুন। সফল হলে সবুজ টিক দেখাবে।

**ধাপ ৫:** Webhook Fields এ নিচের গুলো সিলেক্ট করুন:
- ✅ `messages`
- ✅ `messaging_postbacks`

**ধাপ ৬:** "Save" ক্লিক করুন।

---

## ৭. বট টেস্ট করা

**ধাপ ১:** আপনার ফেসবুক পেজে যান: [facebook.com/juyelshop1](https://facebook.com/juyelshop1)

**ধাপ ২:** "Send Message" বাটনে ক্লিক করুন।

**ধাপ ৩:** মেসেঞ্জারে লিখুন: `hi` বা `হ্যালো`
- বট একটি স্বাগত মেসেজ পাঠাবে।

**ধাপ ৪:** এবার একটি প্রোডাক্টের নাম লিখুন, যেমন: `bag` বা `watch` বা `shoes`
- বট juyelshop.com থেকে প্রোডাক্ট খুঁজে দাম, ছবি ও বিবরণ পাঠাবে।

> **📝 নোট:** প্রথমবার টেস্ট করার সময় শুধুমাত্র আপনি (App Admin) এবং App এর Developer/Tester রোলে থাকা ব্যক্তিরা বট ব্যবহার করতে পারবেন। সবার জন্য চালু করতে ধাপ ৮ দেখুন।

---

## ৮. বট লাইভ করা (App Review)

সবার জন্য বট চালু করতে আপনাকে Facebook App Review করাতে হবে:

**ধাপ ১:** Developer Dashboard → আপনার App → **"App Review"** → **"Permissions and Features"**

**ধাপ ২:** নিচের পারমিশনগুলো Request করুন:
- **pages_messaging** — পেজ থেকে মেসেজ পাঠানোর জন্য

**ধাপ ৩:** প্রতিটি পারমিশনের জন্য:
- কেন দরকার সেটা বাংলায়/ইংরেজিতে লিখুন
- একটি স্ক্রিনকাস্ট ভিডিও তৈরি করুন যেখানে দেখাবেন বট কিভাবে কাজ করে
- "Submit for Review" ক্লিক করুন

**ধাপ ৪:** Facebook টিম রিভিউ করে ১-৫ দিনের মধ্যে অনুমোদন দিবে।

**ধাপ ৫:** অনুমোদন পেলে, App Dashboard এ উপরে **"App Mode"** কে **"Live"** করুন।

> **💡 টিপস:** রিভিউ পাস করার আগেও আপনি App এর Settings → Roles থেকে Tester যোগ করে অন্যদের টেস্ট করাতে পারবেন।

---

## ৯. সমস্যা ও সমাধান

### সমস্যা: Webhook Verify ফেইল হচ্ছে
**সমাধান:** 
- Render.com এ সার্ভিস চালু আছে কিনা চেক করুন
- VERIFY_TOKEN দুই জায়গায় (Render এবং Facebook) একই আছে কিনা দেখুন
- Callback URL এর শেষে `/webhook` আছে কিনা নিশ্চিত করুন

### সমস্যা: বট মেসেজ পাঠাচ্ছে না
**সমাধান:**
- PAGE_ACCESS_TOKEN সঠিক আছে কিনা চেক করুন
- Render.com এর Logs চেক করুন (Dashboard → আপনার Service → Logs)
- Webhook Subscription এ `messages` সিলেক্ট করা আছে কিনা দেখুন

### সমস্যা: প্রোডাক্ট পাওয়া যাচ্ছে না
**সমাধান:**
- juyelshop.com সাইট চালু আছে কিনা চেক করুন
- ব্রাউজারে `juyelshop.com/products/search/আপনার_সার্চ` লিখে দেখুন প্রোডাক্ট আসে কিনা

### সমস্যা: Render.com ফ্রি প্ল্যানে সার্ভার ঘুমিয়ে যায়
**সমাধান:**
- ফ্রি প্ল্যানে ১৫ মিনিট কোনো রিকোয়েস্ট না আসলে সার্ভার স্লিপ হয়ে যায়
- প্রথম মেসেজে ৩০-৬০ সেকেন্ড দেরি হতে পারে
- এটি এড়াতে [UptimeRobot](https://uptimerobot.com) ফ্রি সার্ভিস ব্যবহার করুন — প্রতি ৫ মিনিটে আপনার URL পিং করবে
- অথবা Render.com এর পেইড প্ল্যান ($7/মাস) ব্যবহার করুন

---

## বিকল্প ফ্রি হোস্টিং অপশন

Render.com ছাড়াও আপনি নিচের প্ল্যাটফর্মগুলো ব্যবহার করতে পারেন:

| প্ল্যাটফর্ম | ফ্রি টিয়ার | ওয়েবসাইট |
|-------------|------------|-----------|
| **Railway** | $5 ফ্রি ক্রেডিট/মাস | [railway.app](https://railway.app) |
| **Fly.io** | ফ্রি টিয়ার আছে | [fly.io](https://fly.io) |
| **Cyclic.sh** | ফ্রি | [cyclic.sh](https://cyclic.sh) |
| **Glitch** | ফ্রি | [glitch.com](https://glitch.com) |

---

## সংক্ষেপে পুরো প্রক্রিয়া

```
১. Facebook Developer Account তৈরি করুন
২. Facebook App তৈরি করুন ও Messenger যোগ করুন
৩. Page Access Token তৈরি করুন
৪. GitHub এ কোড আপলোড করুন
৫. Render.com এ ডিপ্লয় করুন (Environment Variables সেট করুন)
৬. Facebook App এ Webhook সেটআপ করুন
৭. টেস্ট করুন
৮. App Review করে লাইভ করুন
```

---

**তৈরি করেছে:** Manus AI  
**ওয়েবসাইট:** juyelshop.com  
**ফেসবুক পেজ:** facebook.com/juyelshop1
