/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import './Footer.css';

const footerGroups = [
  {
    title: 'المنصة',
    links: [
      { label: 'عن منصة بناء', to: '/home' },
      { label: 'كيف تعمل المنصة', to: '/home' },
      { label: 'تواصل معنا', to: '/login' },
      { label: 'الأسئلة الشائعة', to: '/home' },
    ],
  },
  {
    title: 'للعملاء',
    links: [
      { label: 'ابحث عن حرفي', to: '/craftsman' },
      { label: 'كيف تطلب خدمة', to: '/home' },
      { label: 'تقييم الحرفيين', to: '/craftsman' },
    ],
  },
  {
    title: 'للحرفيين',
    links: [
      { label: 'سجّل كحرفي', to: '/login' },
      { label: 'كيف تعرض خدماتك', to: '/login' },
      { label: 'مميزات الانضمام', to: '/home' },
    ],
  },
];

function Footer() {
  return (
    <footer className="site-footer" dir="rtl">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <span className="site-footer__logo">Binaa Pal</span>
          <p>منصة تربط العملاء بأصحاب المهن والحرف الموثوقين في فلسطين.</p>
        </div>

        <div className="site-footer__grid">
          {footerGroups.map((group) => (
            <div className="site-footer__group" key={group.title}>
              <h4>{group.title}</h4>
              <ul>
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="site-footer__group">
            <h4>تابعنا</h4>
            <div className="site-footer__socials">
              <a href="https://twitter.com" aria-label="Twitter" rel="noreferrer" target="_blank"><FaTwitter /></a>
              <a href="https://instagram.com" aria-label="Instagram" rel="noreferrer" target="_blank"><FaInstagram /></a>
              <a href="https://youtube.com" aria-label="YouTube" rel="noreferrer" target="_blank"><FaYoutube /></a>
              <a href="https://facebook.com" aria-label="Facebook" rel="noreferrer" target="_blank"><FaFacebook /></a>
            </div>
            <div className="site-footer__mini-links">
              <Link to="/login">تواصل معنا</Link>
              <Link to="/home">سياسة الخصوصية</Link>
              <Link to="/home">الشروط والأحكام</Link>
            </div>
          </div>
        </div>

        <div className="site-footer__bottom">
          © {new Date().getFullYear()} بناء بال (Binaa Pal) - جميع الحقوق محفوظة
        </div>
      </div>
    </footer>
  );
}

export default Footer;
