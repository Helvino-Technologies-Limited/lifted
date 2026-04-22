-- ============================================
-- LIFTED TO LIFT - Database Schema
-- ============================================

-- Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Site Settings (contact info, social links, etc.)
CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT,
  label VARCHAR(255),
  category VARCHAR(100) DEFAULT 'general',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Page Content (editable content for all sections)
CREATE TABLE IF NOT EXISTS page_content (
  id SERIAL PRIMARY KEY,
  page VARCHAR(100) NOT NULL,
  section VARCHAR(100) NOT NULL,
  field VARCHAR(100) NOT NULL DEFAULT 'body',
  content TEXT,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(page, section, field)
);

-- Media Library
CREATE TABLE IF NOT EXISTS media (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(500) NOT NULL,
  url TEXT NOT NULL,
  public_id TEXT,
  thumbnail_url TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('image', 'video')),
  alt_text VARCHAR(500),
  caption TEXT,
  category VARCHAR(100) DEFAULT 'general',
  page VARCHAR(100),
  display_order INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Team Members
CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  bio TEXT,
  photo_url TEXT,
  email VARCHAR(255),
  linkedin_url TEXT,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- News & Stories
CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug VARCHAR(500) UNIQUE,
  excerpt TEXT,
  body TEXT,
  image_url TEXT,
  video_url TEXT,
  author VARCHAR(255) DEFAULT 'LIFTED TO LIFT',
  published BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Migrate existing news table (safe on re-run)
ALTER TABLE news ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Newsletters
CREATE TABLE IF NOT EXISTS newsletters (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  cover_image_url TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pillar Institutions (for the tree under Institutional Stewardship)
CREATE TABLE IF NOT EXISTS pillar_institutions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  photo_url TEXT,
  category VARCHAR(255),
  location VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Partners
CREATE TABLE IF NOT EXISTS partners (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  type VARCHAR(100) DEFAULT 'partner',
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE
);

-- Contact Messages (from public contact form)
CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sponsored Children
CREATE TABLE IF NOT EXISTS sponsored_children (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  age INTEGER,
  grade VARCHAR(100),
  story TEXT,
  photo_url TEXT,
  photo_public_id TEXT,
  sponsored BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Upcoming Events
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date TIMESTAMP NOT NULL,
  location VARCHAR(255),
  image_url TEXT,
  image_public_id TEXT,
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Listed Needs
CREATE TABLE IF NOT EXISTS needs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  quantity_needed INTEGER,
  quantity_fulfilled INTEGER DEFAULT 0,
  urgent BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Gallery Albums
CREATE TABLE IF NOT EXISTS gallery_albums (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- SEED DATA
-- ============================================

-- Default admin user (password: Admin@LiftedToLift2024)
INSERT INTO admin_users (username, password_hash, email, role)
VALUES ('admin', '$2b$12$placeholder_will_be_set_by_init', 'admin@liftedtolift.org', 'superadmin')
ON CONFLICT (username) DO NOTHING;

-- Site Settings defaults
INSERT INTO site_settings (key, value, label, category) VALUES
  ('org_name', 'LIFTED TO LIFT', 'Organisation Name', 'general'),
  ('tagline', 'Blessed to be a blessing', 'Tagline', 'general'),
  ('vision', 'A legacy of transformed individuals lifting others.', 'Vision Statement', 'general'),
  ('phone_primary', '+254 XXX XXX XXX', 'Primary Phone', 'contact'),
  ('phone_secondary', '', 'Secondary Phone', 'contact'),
  ('email_primary', 'info@liftedtolift.org', 'Primary Email', 'contact'),
  ('email_secondary', '', 'Secondary Email', 'contact'),
  ('address_line1', 'P.O. Box XXXX', 'Address Line 1', 'contact'),
  ('address_line2', 'Nairobi, Kenya', 'Address Line 2', 'contact'),
  ('location_city', 'Nairobi', 'City', 'contact'),
  ('location_country', 'Kenya', 'Country', 'contact'),
  ('facebook_url', '#', 'Facebook URL', 'social'),
  ('twitter_url', '#', 'Twitter/X URL', 'social'),
  ('instagram_url', '#', 'Instagram URL', 'social'),
  ('youtube_url', '#', 'YouTube URL', 'social'),
  ('linkedin_url', '#', 'LinkedIn URL', 'social'),
  ('hero_video_url', '', 'Hero Background Video URL', 'media'),
  ('hero_title', 'Lifting Lives, Building Futures', 'Hero Title', 'hero'),
  ('hero_subtitle', 'Together, we create a legacy of transformed individuals lifting others in our communities.', 'Hero Subtitle', 'hero'),
  ('stats_beneficiaries', '500+', 'Stat: Beneficiaries', 'stats'),
  ('stats_schools', '12', 'Stat: Schools Partnered', 'stats'),
  ('stats_youth_trained', '200+', 'Stat: Youth Trained', 'stats'),
  ('stats_seniors_supported', '150+', 'Stat: Seniors Supported', 'stats'),
  ('about_story', 'LIFTED TO LIFT was founded on the belief that every individual who has been blessed with opportunities has a responsibility to lift others. Our journey began in the heart of Kenya, driven by a vision of transformed communities where education, empowerment, and dignity are accessible to all.', 'About Story', 'about'),
  ('footer_text', 'Dedicated to lifting lives and building a legacy of hope across communities.', 'Footer Text', 'general'),
  -- Donation / Payment Details
  ('donation_page_title', 'Support Our Mission', 'Donation Page Title', 'donation'),
  ('donation_page_subtitle', 'Your generosity transforms lives. Every contribution, big or small, helps us lift communities across Kenya.', 'Donation Page Subtitle', 'donation'),
  ('donation_page_message', '', 'Donation Custom Message', 'donation'),
  ('donation_mpesa_paybill', '', 'M-Pesa Paybill Number', 'donation'),
  ('donation_mpesa_account', '', 'M-Pesa Account Name', 'donation'),
  ('donation_mpesa_till', '', 'M-Pesa Till Number (Buy Goods)', 'donation'),
  ('donation_mpesa_name', 'LIFTED TO LIFT', 'M-Pesa Registered Name', 'donation'),
  ('donation_bank_name', '', 'Bank Name', 'donation'),
  ('donation_bank_branch', '', 'Bank Branch', 'donation'),
  ('donation_bank_account_name', '', 'Bank Account Name', 'donation'),
  ('donation_bank_account_number', '', 'Bank Account Number', 'donation'),
  ('donation_bank_swift', '', 'SWIFT / BIC Code (International)', 'donation'),
  ('donation_paypal_link', '', 'PayPal.me Link or Email', 'donation')
ON CONFLICT (key) DO NOTHING;

-- Default page content
INSERT INTO page_content (page, section, field, content) VALUES
  ('home', 'hero', 'title', 'Lifting Lives, Building Futures'),
  ('home', 'hero', 'subtitle', 'Together, we create a legacy of transformed individuals lifting others in our communities.'),
  ('home', 'hero', 'cta_primary', 'Our Programs'),
  ('home', 'hero', 'cta_secondary', 'Get Involved'),
  ('home', 'impact', 'title', 'Our Impact in Numbers'),
  ('home', 'impact', 'description', 'Every number represents a life touched, a future brightened, and a community strengthened.'),
  ('about', 'mission', 'title', 'Who We Are'),
  ('about', 'mission', 'body', 'LIFTED TO LIFT is a community-driven organisation founded on the belief that those who have been blessed must become a blessing to others. We work tirelessly to transform lives through education, empowerment, and care across communities in Kenya.'),
  ('about', 'vision', 'title', 'Our Vision'),
  ('about', 'vision', 'body', 'A legacy of transformed individuals lifting others.'),
  ('about', 'values', 'title', 'Our Core Values'),
  ('programs', 'header', 'title', 'Our Five Strategic Pillars'),
  ('programs', 'header', 'subtitle', 'Five comprehensive pillars of action that guide our mission to lift communities and transform lives.'),
  ('programs', 'pillar1', 'title', 'Educational Equity & Scholarships'),
  ('programs', 'pillar1', 'body', 'Partnering with public primary and junior schools to provide mentorship, essential academic resources, and comprehensive scholarships to ensure equal learning opportunities for all students.'),
  ('programs', 'pillar2', 'title', 'Youth Empowerment'),
  ('programs', 'pillar2', 'body', 'Equipping unemployed youth who faced educational barriers with practical, technical skills to foster self-reliance and employability.'),
  ('programs', 'pillar3', 'title', 'Senior Citizens'' Welfare & Support'),
  ('programs', 'pillar3', 'body', 'Upholding the dignity of the elderly by providing critical assistance with healthcare, nutrition, and clothing.'),
  ('programs', 'pillar4', 'title', 'Institutional Stewardship & Reinvestment'),
  ('programs', 'pillar4', 'body', 'Giving back to the institutions that shaped our foundation, ensuring their continued growth and preserving their legacy for future generations.'),
  ('programs', 'pillar5', 'title', 'Partnerships & Networking'),
  ('programs', 'pillar5', 'body', 'Collaborating with local and international partners in order to maximize our impact.'),
  ('contact', 'header', 'title', 'Get In Touch'),
  ('contact', 'header', 'subtitle', 'We''d love to hear from you. Reach out to learn more about our work or how you can get involved.')
ON CONFLICT (page, section, field) DO NOTHING;

-- Team members are managed entirely via the admin panel (/admin/team)
